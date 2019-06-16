import time
from random import uniform
from datetime import datetime
from threading import Thread
from Logger import Logger


class ThermalMonitor:

    # ----------- ONLY FOR SIMULATION -----------
    class FakeSensor:
        def __init__(self, sensor_id):
            self.id = sensor_id

        @staticmethod
        def get_temperature():
            return uniform(12, 60)

    class FakeW1ThermSensor:
        @staticmethod
        def get_available_sensors():
            return [ThermalMonitor.FakeSensor(62346), ThermalMonitor.FakeSensor(53245)]
    # -------------------------------------------

    class TempData:
        def __init__(self, temp=None, sensor_id=None, timestamp=None):
            self.temp = temp
            self.sensor_id = sensor_id
            self.timestamp = timestamp

    def __init__(self, simulate=False, logger=None):
        self.on_new_temp_listener = None
        self.__logger = logger
        self.__simulate = simulate
        self.__terminate = False
        self.__stopped = True
        self.__temps = []
        self.__log_file = open(datetime.now().strftime('%Y-%m-%d_%H%M%S') + '_temps.csv', 'w', 1)
        self.__log_file.write('timestamp,sensor_id,temperature\n')
        self.__sensors_monitor = Thread(target=self.read_from_sensors)
        self.__sensors_monitor.start()

    def get_temperatures(self):
        return self.__temps

    def get_last_temperature(self):
        return self.__temps[-1] if len(self.__temps) > 0 else None

    def start(self):
        self.log('Thermal monitor service started', Logger.LogLevel.DEBUG)
        self.__stopped = False

    def stop(self):
        self.log('Thermal monitor service stopped', Logger.LogLevel.DEBUG)
        self.__stopped = True

    def close(self):
        self.log('Closing thermal monitor service...', Logger.LogLevel.DEBUG)
        self.__terminate = True
        self.__sensors_monitor.join()
        self.log('Thermal monitor service closed', Logger.LogLevel.DEBUG)

    def register_new_temperature(self, temp_data):
        log_msg = 'Time: %s Sensor: %s Temp: %.3f' % (temp_data.timestamp, temp_data.sensor_id, temp_data.temp)
        self.log(log_msg, Logger.LogLevel.DEBUG)
        self.__temps.append(temp_data)
        self.__log_file.write('%s,%s,%s\n' % (temp_data.timestamp, temp_data.sensor_id, temp_data.temp))
        if self.on_new_temp_listener is not None:
            self.on_new_temp_listener(temp_data)

    def read_from_sensors(self):
        if not self.__simulate:
            from w1thermsensor import W1ThermSensor
            therm_sensor = W1ThermSensor
        else:
            therm_sensor = ThermalMonitor.FakeW1ThermSensor

        while not self.__terminate:
            if not self.__stopped:
                for sensor in therm_sensor.get_available_sensors():
                    temp_data = ThermalMonitor.TempData()
                    temp_data.temp = sensor.get_temperature()
                    temp_data.sensor_id = sensor.id
                    temp_data.timestamp = int(round(time.time() * 1000))
                    self.register_new_temperature(temp_data)
            time.sleep(1)

        self.__log_file.close()

    def log(self, msg, level):
        if self.__logger is not None:
            self.__logger.log(msg, level)
