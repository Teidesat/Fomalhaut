"""
Raspberry Pi monitor server.

This software is designed to run on the emitter and receiver of concept tests on land,
its main function is to monitor them using the data provided by the different sensors
and send the data to the control panel for storage and further analysis.

Prerequisites:
    - Raspberry Pi with a recent version of Raspbian and 1-wire and I2C interfaces enabled (sudo raspi-config)

    - Python 3.4+ with pip3 (apt install python3-pip)

    - Install the following python modules (as system modules) and packages:

        - Install w1thermsensor package (pip3 install w1thermsensor)

        - Install Adafruit Python DHT Sensor Library (pip3 install Adafruit_DHT)

        - Install smbus package if not already installed (apt install python3-smbus)

        - Install dependencies for some python modules compilation (apt install libffi-dev libsrtp2-dev pkg-config)

        - Install media codecs (apt install libavdevice-dev libavfilter-dev libopus-dev libvpx-dev)

        - Install aiohttp, aiohttp_index, aiortc and opencv-python packages (pip3 install aiohttp aiohttp_index aiortc)

        - Install colorama package (pip3 install colorama)

The following w1 therm sensor devices are supported:
    - DS18S20
    - DS1822
    - DS18B20
    - DS28EA00
    - DS1825/MAX31850K

The humidity and temperature sensor DHT22 and I2C sensors are also supported.

Authors: Andrés García Pérez (teidesat11@ull.edu.es), Jorge Sierra Acosta (teidesat06@ull.edu.es)
"""

import os
import platform
import argparse
import sys
import signal
import time
import json

from src.utils.Logger import Logger
from src.services.MonitorService import MonitorService
from src.services.CameraService import CameraService
from src.WebRTCServer import WebRTCServer

def on_new_log_listener(message, server):
    server.send_to_all(json.dumps(message))


def on_new_frame_listener(ret, frame, server):
    server.add_frame_to_queue(frame)


def on_new_message_listener(message, monitor, analyzer, server):
    request_id = message['request_id'] if ('request_id' in message.keys()) else None

    if message['type'] == 'cmd':
        if message['cmd'] == 'start_monitor':
            monitor.start()
            server.send_to_all('"ok"', request_id)
        elif message['cmd'] == 'is_monitor_running':
            server.send_to_all('"' + str(monitor.is_running()) + '"', request_id)
        elif message['cmd'] == 'stop_monitor':
            monitor.stop()
            server.send_to_all('"ok"', request_id)

    elif message['type'] == 'set':
        if message['data'] == 'camera_id':
            pass

    elif message['type'] == 'get':
        if message['data'] == 'video_stats':
            server.send_to_all(analyzer.get_stats(), request_id)

        elif message['data'] == 'available_cameras':
            server.send_to_all(analyzer.get_available_cameras(), request_id)

        elif message['data'] == 'sensors_data':
            sensors_data = monitor.get_last_sensors_data()
            if not monitor.is_running() or sensors_data is None:
                server.send_to_all({}, request_id)
            else:
                parsed_sensors_data = []
                for sensor_data in sensors_data:
                    parsed_sensors_data.append({
                        'timestamp': sensor_data.timestamp,
                        'sensor_id': sensor_data.sensor_id,
                        'type': sensor_data.type,
                        'value': sensor_data.value
                    })
                server.send_to_all(parsed_sensors_data, request_id)
    else:
        server.send_to_all('"Unkown message or command"', request_id)

def wait_for_server_close(server):
    time.sleep(1)
    while server.is_running():
        time.sleep(1)

def start_server(simulate, period, ip, port, resolution, automatic_start, logger):
    monitor  = MonitorService(simulate=simulate, period=period, logger=logger)
    analyzer = CameraService(on_new_frame_target_fps=0, logger=logger)
    server   = WebRTCServer(port=port, ip=ip, logger=logger, resolution=resolution)

    logger.on_new_log_listener     = lambda message: on_new_log_listener(message, server)
    analyzer.on_new_frame_listener = lambda ret, frame: on_new_frame_listener(ret, frame, server)
    server.on_new_message_listener = lambda message: on_new_message_listener(message, monitor, analyzer, server)

    server.start()
    if automatic_start:
        monitor.start()
        analyzer.start()

    def terminate(sig, frame):
        logger.on_new_log_listener     = None
        analyzer.on_new_frame_listener = None
        server.on_new_message_listener = None
        monitor.stop()
        analyzer.stop()
        server.stop()

    signal.signal(signal.SIGINT, terminate)
    signal.signal(signal.SIGTERM, terminate)
    wait_for_server_close(server)

def main():
    parser = argparse.ArgumentParser(description='Monitor server.')
    parser.add_argument('-d', '--debug', action='store_true', help='enable debug mode')
    parser.add_argument('-s', '--simulate', action='store_true', help='simulate the sensors')
    parser.add_argument('-r', '--resolution', default='640x480', help='video size (default: 640x480)')
    parser.add_argument('-p', '--period', help='sensor reading period in ms (default: 1000)', default=1000)
    parser.add_argument('--ip', help='listening ip (default: 127.0.0.1)', default='127.0.0.1')
    parser.add_argument('--port', help='listening port (default: 9090)', default=9090)
    parser.add_argument('-a', '--automatic-start', action='store_true',
                        help='start the monitor service automatically at the start')
    parser.set_defaults(debug=False, simulate=False, cli=False, automatic_start=False)
    args = parser.parse_args()
    logger = Logger(args.debug)

    if not args.simulate:
        if platform.system() != 'Linux':
            logger.log('OS not compatible for some sensors', Logger.LogLevel.WARNING)

        # if os.getuid() != 0:
        #    logger.log('Must have root access', Logger.LogLevel.ERROR)
        #    sys.exit(1)

    start_server(args.simulate, args.period, args.ip, args.port, args.resolution, args.automatic_start, logger)
    sys.exit(0)


if __name__ == "__main__":
    main()
