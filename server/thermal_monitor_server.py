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
import time
import signal
from colorama import init as init_colorama
from colorama import Fore, Style
from enum import Enum, auto
from datetime import datetime
from threading import Thread
from threading import Semaphore

from thermalmonitor import ThermalMonitor
from thermalmonitor.ttypes import TempData
from thrift.protocol import TJSONProtocol
from thrift.server import TServer
from thrift.transport import TSocket
from thrift.transport import TTransport

# ----------- ONLY FOR SIMULATION -----------
from random import uniform


class FakeSensor:
    def __init__(self, sensor_id):
        self.id = sensor_id

    @staticmethod
    def get_temperature():
        return uniform(12, 60)


class FakeW1ThermSensor:
    @staticmethod
    def get_available_sensors():
        return [FakeSensor(62346), FakeSensor(53245)]
# ----------- ONLY FOR SIMULATION -----------


class LogLevel(Enum):
    DEBUG = auto()
    INFO = auto()
    ERROR = auto()


DEBUG_MODE = False


class ThermalMonitorHandler:
    def __init__(self, simulate=False):
        self.__simulate = simulate
        self.__terminate = False
        self.__stopped = True
        self.__temps = []
        self.__server = None
        self.__log_file = open(datetime.now().strftime('%Y-%m-%d %H%M%S') + ' temps log', 'w', 1)
        self.__sensors_monitor = Thread(target=self.read_from_sensors)
        self.__sensors_monitor.start()

    def set_server(self, server):
        self.__server = server

    def get_temperatures(self):
        return self.__temps

    def get_last_temperature(self):
        return self.__temps[-1] if len(self.__temps) > 0 else None

    def start(self):
        log('Thermal monitor service started', LogLevel.DEBUG)
        self.__stopped = False

    def stop(self):
        log('Thermal monitor service stopped', LogLevel.DEBUG)
        self.__stopped = True

    def close(self):
        log('Closing thermal monitor service...', LogLevel.DEBUG)
        self.stop()
        self.__terminate = True
        self.__sensors_monitor.join()
        log('Thermal monitor service closed', LogLevel.DEBUG)

    def read_from_sensors(self):
        if not self.__simulate:
            from w1thermsensor import W1ThermSensor
            therm_sensor = W1ThermSensor
        else:
            therm_sensor = FakeW1ThermSensor

        while not self.__terminate:
            if not self.__stopped:
                for sensor in therm_sensor.get_available_sensors():
                    temp_data = TempData()
                    temp_data.temp = sensor.get_temperature()
                    temp_data.sensor_id = sensor.id
                    temp_data.timestamp = int(round(time.time() * 1000))
                    log_msg = 'Time: %s Sensor: %s Temp: %.3f' \
                              % (temp_data.timestamp, temp_data.sensor_id, temp_data.temp)
                    if DEBUG_MODE:
                        log(log_msg, LogLevel.DEBUG)
                    self.__temps.append(temp_data)
                    self.__log_file.write(log_msg + '\n')
            time.sleep(1)

        self.__log_file.close()


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


def start_server(simulate, cli, ip, port, automatic_start):
    log('Starting sever...', LogLevel.INFO)

    handler = ThermalMonitorHandler(simulate)
    processor = ThermalMonitor.Processor(handler)
    transport = TSocket.TServerSocket(host=ip, port=port)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TJSONProtocol.TJSONProtocolFactory()

    server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)
    handler.set_server(server)

    if automatic_start:
        handler.start()

    def start_server_thread():
        log('Server started', LogLevel.INFO)
        server.serve()

    server_thread = Thread(target=start_server_thread, daemon=True)
    server_thread.start()
    semaphore = Semaphore(0)

    def terminate():
        handler.close()
        semaphore.release()
    signal.signal(signal.SIGINT, terminate)
    signal.signal(signal.SIGTERM, terminate)

    if cli:
        start_cli(exit_callback=terminate)

    semaphore.acquire()
    log('Server closed', LogLevel.INFO)
    transport.close()
    log('Socket closed', LogLevel.DEBUG)


def main():
    global DEBUG_MODE

    init_colorama()
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
    DEBUG_MODE = args.debug

    if not args.simulate:
        if platform.system() != 'Linux':
            log('OS not compatible', LogLevel.ERROR)
            sys.exit(1)

        if os.getuid() != 0:
            log('Must have root access', LogLevel.ERROR)
            sys.exit(1)

    start_server(args.simulate, args.cli, args.ip, args.port, args.automatic_start)
    sys.exit(0)


def log(msg, level=LogLevel.INFO):
    if level == LogLevel.DEBUG:
        if DEBUG_MODE:
            print('%s[%s] %s%s' % (Fore.BLUE, level.name, msg, Style.RESET_ALL))
    else:
        if level == LogLevel.INFO:
            print('%s[%s] %s%s' % (Fore.GREEN, level.name, msg, Style.RESET_ALL))
        else:
            print('%s[%s] %s%s' % (Fore.RED, level.name, msg, Style.RESET_ALL))


if __name__ == "__main__":
    main()
