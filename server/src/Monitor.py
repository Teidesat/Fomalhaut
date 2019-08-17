import time
from datetime import datetime
from threading import Thread
from src.Logger import Logger
from src.SensorsProvider import SensorsProvider
from pathlib import Path


class Monitor:

    class SensorData:
        def __init__(self, value=None, sensor_id=None, timestamp=None, type=None):
            self.value = value
            self.sensor_id = sensor_id
            self.timestamp = timestamp
            self.type = type

    def __init__(self, simulate=False, period=1000, logger=None):
        Path('./log').mkdir(exist_ok=True)
        self.on_new_sensor_data_listener = None
        self.__logger = logger
        self.__simulate = simulate
        self.__period = float(period)
        self.__terminate = False
        self.__stopped = True
        self.__sensors_data = []
        self.__log_file = open('log/' + datetime.now().strftime('%Y-%m-%d_%H%M%S') + '_sensors_data.csv', 'w', 1)
        self.__log_file.write('timestamp;sensor_id;type;value\n')
        self.__sensors = SensorsProvider.get_available_sensors(self.__simulate, logger=self.__logger)
        self.__sensors_monitor = Thread(target=self.read_from_sensors)
        self.__sensors_monitor.start()

    def get_sensors_data(self):
        return self.__sensors_data

    def get_last_sensor_data(self):
        return self.__sensors_data[-1] if len(self.__sensors_data) > 0 else None

    def start(self):
        self.__log('Monitor service started', Logger.LogLevel.INFO)
        self.__stopped = False

    def stop(self):
        self.__log('Monitor service stopped', Logger.LogLevel.INFO)
        self.__stopped = True

    def close(self):
        self.__log('Closing monitor service...', Logger.LogLevel.DEBUG)
        self.__terminate = True
        self.__sensors_monitor.join()
        self.__log('Monitor service closed', Logger.LogLevel.DEBUG)

    def register_new_sensor_data(self, sensor_data):
        log_msg = 'SENSOR DATA: timestamp: %s, sensor_id: %s, type: %s' % (sensor_data.timestamp, sensor_data.sensor_id, sensor_data.type)

        if type(sensor_data.value) is list:
            log_msg += ', values: %s' % ', '.join('{:0.3f}'.format(i) for i in sensor_data.value)
        elif type(sensor_data.value) is float:
            log_msg += ', value: %.3f' % sensor_data.value
        else:
            self.__log('Invalid value format retrieved from sensor %s' % sensor_data.sensor_id, Logger.LogLevel.WARNING)
            log_msg += ', value: INVALID VALUE'

        self.__log(log_msg, Logger.LogLevel.DEBUG)
        self.__sensors_data.append(sensor_data)
        self.__log_file.write('%s;%s;%s;%s\n' % (sensor_data.timestamp, sensor_data.sensor_id, sensor_data.type, sensor_data.value))
        if self.on_new_sensor_data_listener is not None:
            self.on_new_sensor_data_listener(sensor_data)

    def read_from_sensors(self):
        last_time = 0
        while not self.__terminate:
            if not self.__stopped:
                if (time.time() - last_time) * 1000 >= self.__period:
                    last_time = time.time()
                    for sensor in self.__sensors:
                        sensor_data = Monitor.SensorData()
                        try:
                            sensor_data.value = sensor.get_value()
                        except:
                            self.__log('Error while trying to read the sensor \'%s\'' % sensor.get_id(), Logger.LogLevel.WARNING)
                            sensor_data.value = None
                        sensor_data.sensor_id = sensor.get_id()
                        sensor_data.type = sensor.get_type()
                        sensor_data.timestamp = int(round(time.time() * 1000))

                        if sensor_data.value is None:
                            sensor_data.value = -999.0
                        elif type(sensor_data.value) is list:
                            sensor_data.value = [-999.0 if v is None else v for v in sensor_data.value]

                        self.register_new_sensor_data(sensor_data)
            time.sleep(.05)

        self.__log_file.close()

    def __log(self, msg, level):
        if self.__logger is not None:
            self.__logger.log(msg, level)
