import time
from random import uniform
from datetime import datetime
from threading import Thread
from Logger import Logger


class Monitor:

    # ----------- ONLY FOR SIMULATION -----------
    class FakeTemperatureSensor:
        def __init__(self, sensor_id):
            self.id = sensor_id

        @staticmethod
        def get_temperature():
            return uniform(12, 60)
    
    class FakeVoltageSensor:
        def __init__(self, sensor_id):
            self.id = sensor_id

        @staticmethod
        def get_value():
            return uniform(1, 2)

        @staticmethod
        def get_type():
            return 'voltage'

    class FakeW1ThermSensor:
        @staticmethod
        def get_available_sensors():
            return [Monitor.FakeTemperatureSensor(62346), Monitor.FakeTemperatureSensor(53245), Monitor.FakeVoltageSensor(51745)]
    # -------------------------------------------

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
        if not self.__simulate:
            from w1thermsensor import W1ThermSensor
            sensors_provider = W1ThermSensor
        else:
            sensors_provider = Monitor.FakeW1ThermSensor

        while not self.__terminate:
            if not self.__stopped:
                for sensor in sensors_provider.get_available_sensors():
                    sensor_data = Monitor.SensorData()
                    try:
                        sensor_data.value = sensor.get_temperature()
                        sensor_data.type = 'temperature'
                    except AttributeError:
                        sensor_data.value = sensor.get_value()
                        sensor_data.type = sensor.get_type()
                    sensor_data.sensor_id = sensor.id
                    sensor_data.timestamp = int(round(time.time() * 1000))
                    self.register_new_sensor_data(sensor_data)
            time.sleep(1)

        self.__log_file.close()

    def log(self, msg, level):
        if self.__logger is not None:
            self.__logger.log(msg, level)
