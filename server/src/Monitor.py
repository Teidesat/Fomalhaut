import time
from datetime import datetime
from threading import Thread
from src.Logger import Logger
from src.SensorsProvider import SensorsProvider


class Monitor:

    class SensorData:
        def __init__(self, value=None, sensor_id=None, timestamp=None, type=None):
            self.value = value
            self.sensor_id = sensor_id
            self.timestamp = timestamp
            self.type = type

    def __init__(self, simulate=False, logger=None):
        self.on_new_sensor_data_listener = None
        self.__logger = logger
        self.__simulate = simulate
        self.__terminate = False
        self.__stopped = True
        self.__sensors_data = []
        self.__log_file = open(datetime.now().strftime('%Y-%m-%d_%H%M%S') + '_sensors_data.csv', 'w', 1)
        self.__log_file.write('timestamp,sensor_id,type,value\n')
        self.__sensors_monitor = Thread(target=self.read_from_sensors)
        self.__sensors_monitor.start()

    def get_sensors_data(self):
        return self.__sensors_data

    def get_last_sensor_data(self):
        return self.__sensors_data[-1] if len(self.__sensors_data) > 0 else None

    def start(self):
        self.log('Monitor service started', Logger.LogLevel.DEBUG)
        self.__stopped = False

    def stop(self):
        self.log('Monitor service stopped', Logger.LogLevel.DEBUG)
        self.__stopped = True

    def close(self):
        self.log('Closing monitor service...', Logger.LogLevel.DEBUG)
        self.__terminate = True
        self.__sensors_monitor.join()
        self.log('Monitor service closed', Logger.LogLevel.DEBUG)

    def register_new_sensor_data(self, sensor_data):
        log_msg = 'Time: %s Sensor: %s Type: %s Value: %.3f' % (sensor_data.timestamp, sensor_data.sensor_id, sensor_data.type, sensor_data.value)
        self.log(log_msg, Logger.LogLevel.DEBUG)
        self.__sensors_data.append(sensor_data)
        self.__log_file.write('%s,%s,%s,%s\n' % (sensor_data.timestamp, sensor_data.sensor_id, sensor_data.type, sensor_data.value))
        if self.on_new_sensor_data_listener is not None:
            self.on_new_sensor_data_listener(sensor_data)

    def read_from_sensors(self):
        while not self.__terminate:
            if not self.__stopped:
                for sensor in SensorsProvider.get_available_sensors(self.__simulate):
                    sensor_data = Monitor.SensorData()
                    try:
                        sensor_data.value = sensor.get_temperature()
                        sensor_data.sensor_id = sensor.id
                        sensor_data.type = 'temperature'
                    except AttributeError:
                        sensor_data.value = sensor.get_value()
                        sensor_data.sensor_id = sensor.get_id()
                        sensor_data.type = sensor.get_type()
                    sensor_data.timestamp = int(round(time.time() * 1000))
                    self.register_new_sensor_data(sensor_data)
            time.sleep(1)

        self.__log_file.close()

    def log(self, msg, level):
        if self.__logger is not None:
            self.__logger.log(msg, level)
