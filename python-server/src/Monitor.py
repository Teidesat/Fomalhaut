import time
from datetime import datetime
from threading import Thread
from src.Logger import Logger
from src.Service import Service
from src.SensorsProvider import SensorsProvider
from pathlib import Path


class Monitor(Service):

    class SensorData:
        def __init__(self, value=None, sensor_id=None, timestamp=None, type=None):
            self.value = value
            self.sensor_id = sensor_id
            self.timestamp = timestamp
            self.type = type

    def __init__(self, simulate=False, period=1000, logger=None):
        super().__init__(service_name="Monitor", logger=logger)
        Path('./log').mkdir(exist_ok=True)
        self.on_new_sensor_data_listener = None
        self.__simulate = simulate
        self.__period = float(period)
        self.__sensors_data = [] # TODO wouldnt this fill the memory eventually ?
        self.__log_file = open('log/' + datetime.now().strftime('%Y-%m-%d_%H%M%S') + '_sensors_data.csv', 'w', 1)
        self.__log_file.write('timestamp;sensor_id;type;value\n')
        self.__sensors = SensorsProvider.get_available_sensors(self.__simulate, logger)
        self.__last_time = 0

    def __del__(self):
        self.__log_file.close()

    def get_sensors_data(self):
        return self.__sensors_data

    def get_last_sensors_data(self):
        # TODO use lock to prevent race conditions
        """
        Data is saved in the sensors in order. We just need to retrieve the last
        n data points, where n is the number of sensors.
        """
        if len(self.__sensors) == 0 or len(self.__sensors_data) < len(self.__sensors):
            return None
        return self.__sensors_data[-len(self.__sensors):]

    def get_last_sensor_data(self):
        return self.__sensors_data[-1] if len(self.__sensors_data) > 0 else None

    def register_new_sensor_data(self, sensor_data):
        log_msg = 'SENSOR DATA: timestamp: %s, sensor_id: %s, type: %s' % (sensor_data.timestamp, sensor_data.sensor_id, sensor_data.type)

        if type(sensor_data.value) is list:
            log_msg += ', values: %s' % ', '.join('{:0.3f}'.format(i) for i in sensor_data.value)
        elif type(sensor_data.value) is float:
            log_msg += ', value: %.3f' % sensor_data.value
        else:
            self.log('Invalid value format retrieved from sensor %s' % sensor_data.sensor_id, Logger.LogLevel.WARNING)
            log_msg += ', value: INVALID VALUE'

        self.log(log_msg, Logger.LogLevel.DEBUG)
        self.__sensors_data.append(sensor_data)
        self.__log_file.write('%s;%s;%s;%s\n' % (sensor_data.timestamp, sensor_data.sensor_id, sensor_data.type, sensor_data.value))
        if self.on_new_sensor_data_listener is not None:
            self.on_new_sensor_data_listener(sensor_data)

    def service_run(self):
        if (time.time() - self.__last_time) * 1000 >= self.__period:
            self.__last_time = time.time()
            for sensor in self.__sensors:
                sensor_data = Monitor.SensorData()
                try:
                    sensor_data.value = sensor.get_value()
                except:
                    self.log('Error while trying to read the sensor \'%s\'' % sensor.get_id(), Logger.LogLevel.WARNING)
                    sensor_data.value = None
                sensor_data.sensor_id = sensor.get_id()
                sensor_data.type = sensor.get_type()
                sensor_data.timestamp = int(round(time.time() * 1000))

                if sensor_data.value is None:
                    sensor_data.value = -999.0
                elif type(sensor_data.value) is list:
                    sensor_data.value = [-999.0 if v is None else v for v in sensor_data.value]

                self.register_new_sensor_data(sensor_data)
        else:
            time.sleep(0.05)
