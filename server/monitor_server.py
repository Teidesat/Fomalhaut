"""
Raspberry Pi monitor server.

This software is designed to run on the emitter and receiver of concept tests on land,
its main function is to monitor them using the data provided by the different sensors
and send the data to the control panel for storage and further analysis.

Prerequisites:
    - On the Raspberry Pi, add dtoverlay=w1-gpio (for regular connection)
    or dtoverlay=w1-gpio,pullup="y" (for parasitic connection) to /boot/config.txt.
    The default data pin is GPIO4 (RaspPi connector pin 7), but that can be changed from 4
    to x with dtoverlay=w1-gpio,gpiopin=x

    - Install w1thermsensor package (pip install w1thermsensor)

    - Install media codecs (apt install libavdevice-dev libavfilter-dev libopus-dev libvpx-dev pkg-config)

    - Install aiohttp, aiortc and opencv-python packages (pip install aiohttp aiortc opencv-python)

The following w1 therm sensor devices are supported:
    - DS18S20
    - DS1822
    - DS18B20
    - DS28EA00
    - DS1825/MAX31850K

Author: Andrés García Pérez (teidesat11@ull.edu.es)
"""

import os
import platform
import argparse
import sys
import signal
import json
from threading import Semaphore

from Logger import Logger
from Monitor import Monitor
from WebRTCServer import WebRTCServer


def on_new_sensor_data_listener(sensor_data, server):
    server.send_to_all(json.dumps({
        'type': 'sensor_data',
        'sensorData': {
            'timestamp': sensor_data.timestamp,
            'sensor_id': sensor_data.sensor_id,
            'type': sensor_data.type,
            'value': sensor_data.value
        }
    }))


def on_new_message_listener(message, monitor, server):
    if message['type'] == 'cmd':
        if message['cmd'] == 'start':
            monitor.start()
        elif message['cmd'] == 'stop':
            monitor.stop()
        elif message['cmd'] == 'request_sensors_data':
            sensors_data = monitor.get_sensors_data()
            parsed_sensors_data = []

            for sensor_data in sensors_data:
                parsed_sensors_data.append({
                    'timestamp': sensor_data.timestamp,
                    'sensor_id': sensor_data.sensor_id,
                    'type': sensor_data.type,
                    'value': sensor_data.value
                })

            server.send_to_all(json.dumps({
                'type': 'sensors_data',
                'sensorsData': parsed_sensors_data
            }))

        server.send_to_all(json.dumps({
            'type': 'log',
            'value': '[INFO] Command "' + message['cmd'] + '" received'
        }))


def start_server(simulate, ip, port, resolution, automatic_start, logger):
    logger.log('Starting server...', Logger.LogLevel.INFO)
    monitor = Monitor(simulate=simulate, logger=logger)

    if automatic_start:
        monitor.start()

    server = WebRTCServer(port=port, ip=ip, logger=logger, resolution=resolution)
    server.start()

    monitor.on_new_sensor_data_listener = lambda sensor_data : on_new_sensor_data_listener(sensor_data, server)
    server.on_new_message_listener = lambda message : on_new_message_listener(message, monitor, server)

    semaphore = Semaphore(0)

    def terminate(sig, frame):
        logger.log('Closing server...', Logger.LogLevel.INFO)
        monitor.close()
        server.close()
        semaphore.release()
    signal.signal(signal.SIGINT, terminate)
    signal.signal(signal.SIGTERM, terminate)

    logger.log('Server started', Logger.LogLevel.INFO)
    semaphore.acquire()
    logger.log('Server closed', Logger.LogLevel.INFO)


def main():
    parser = argparse.ArgumentParser(description='Monitor server.')
    parser.add_argument('-d', '--debug', action='store_true', help='enable debug mode')
    parser.add_argument('-s', '--simulate', action='store_true', help='simulate the sensors')
    parser.add_argument('-r', '--resolution', default='640x480', help='video size (default: 640x480)')
    parser.add_argument('--ip', help='listening ip (default: 127.0.0.1)', default='127.0.0.1')
    parser.add_argument('--port', help='listening port (default: 9090)', default=9090)
    parser.add_argument('-a', '--automatic-start', action='store_true',
                        help='start the monitor service automatically at the start')
    parser.set_defaults(debug=False, simulate=False, cli=False, automatic_start=False)
    args = parser.parse_args()
    logger = Logger(args.debug)

    if not args.simulate:
        if platform.system() != 'Linux':
            logger.log('OS not compatible', Logger.LogLevel.ERROR)
            sys.exit(1)

        if os.getuid() != 0:
            logger.log('Must have root access', Logger.LogLevel.ERROR)
            sys.exit(1)

    start_server(args.simulate, args.ip, args.port, args.resolution, args.automatic_start, logger)
    sys.exit(0)


if __name__ == "__main__":
    main()
