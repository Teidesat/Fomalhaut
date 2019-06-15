"""
Raspberry Pi thermal monitor server.

This software is designed to run on the emitter and receiver of concept tests on land,
its main function is to monitor the temperatures of the different sensors and send the
data to the control panel for storage and further analysis.

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
from threading import Thread
from threading import Semaphore

from server.Logger import Logger
from server.ThermalMonitor import ThermalMonitor
from server.WebRTCServer import WebRTCServer


def start_cli(exit_callback=None):
    def handle_input():
        terminate = False
        while not terminate:
            cmd = input('> ')
            if exit_callback is not None and cmd == 'exit':
                terminate = True
                exit_callback()
            else:
                print('Unknown command %s' % cmd)

    cli_thread = Thread(target=handle_input)
    cli_thread.start()


def start_server(simulate, cli, ip, port, automatic_start, logger):
    logger.log('Starting sever...', Logger.LogLevel.INFO)

    thermal_monitor = ThermalMonitor(simulate=simulate, logger=logger)
    server = WebRTCServer(port)

    if automatic_start:
        thermal_monitor.start()

    def start_server_thread():
        logger.log('Server started', Logger.LogLevel.INFO)
        server.start()

    server_thread = Thread(target=start_server_thread, daemon=True)
    server_thread.start()
    semaphore = Semaphore(0)

    def terminate():
        thermal_monitor.close()
        semaphore.release()
    signal.signal(signal.SIGINT, terminate)
    signal.signal(signal.SIGTERM, terminate)

    if cli:
        start_cli(exit_callback=terminate)

    semaphore.acquire()
    logger.log('Server closed', Logger.LogLevel.INFO)
    logger.log('Socket closed', Logger.LogLevel.DEBUG)


def main():
    parser = argparse.ArgumentParser(description='Thermal monitor server.')
    parser.add_argument('-d', '--debug', action='store_true', help='enable debug mode')
    parser.add_argument('-c', '--cli', action='store_true', help='enable CLI')
    parser.add_argument('-s', '--simulate', action='store_true', help='simulate the sensors')
    parser.add_argument('--ip', help='listening ip (default: 127.0.0.1)', default='127.0.0.1')
    parser.add_argument('--port', help='listening port (default: 9090)', default=9090)
    parser.add_argument('--automatic-start', action='store_true',
                        help='start the thermal monitor service automatically at the start')
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

    start_server(args.simulate, args.cli, args.ip, args.port, args.automatic_start, logger)
    sys.exit(0)


if __name__ == "__main__":
    main()
