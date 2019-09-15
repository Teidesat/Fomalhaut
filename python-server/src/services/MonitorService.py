import time
from datetime import datetime
from threading import Thread
from src.utils.Logger import default_logger as logger
from src.utils.CSVWriter import CSVWriter
from src.services.BaseService import BaseService
from src.sensors.SensorsProvider import SensorsProvider
from pathlib import Path


class MonitorService(BaseService):

    def __init__(self, simulate=False, period=1000):
        super().__init__(service_name="Monitor")
        Path('./log').mkdir(exist_ok=True)
        self.on_new_sensor_data_listener = None
        self.__simulate = simulate
        self.__period = float(period)
        self.__sensors_data = [] # TODO wouldnt this fill the memory eventually ?
        self.__csv_file = CSVWriter('log/' + datetime.now().strftime('%Y-%m-%d_%H%M%S') + '_sensors_data.csv')
        self.__csv_file.write_row(['timestamp', 'sensor_id', 'type;value'])
        self.__sensors = SensorsProvider.get_available_sensors(self.__simulate)
        self.__last_time = 0

    def get_last_sensors_data(self):
        return self.__sensors_data[-1] if len(self.__sensors_data) > 0 else {}

    def format_sensor_value(self, value):
        if isinstance(value, float):
            return '{:0.3f}'.format(value)
        if isinstance(value, list):
            return ','.join(self.format_sensor_value(v) for v in value)
        if isinstance(value, str):
            return value
        if value is None:
            return ''
        return str(value)

    def secure_get_sensor_value(self, sensor):
        try:
            return sensor.get_value()
        except:
            logger.warn('Error while trying to read the sensor \'%s\'' % sensor.get_id())
            return None

    def service_run(self):
        if (time.time() - self.__last_time) * 1000 >= self.__period:
            self.__last_time = time.time()
            timestamp = int(round(time.time() * 1000)) # The timestamp does not need to be sensor specific. The same timestamp for all sensors is precise enough

            data = {
                'timestamp': timestamp,
                'sensors': []
            }

            for sensor in self.__sensors:
                sensor_data = {
                    'value':     self.secure_get_sensor_value(sensor),
                    'sensor_id': sensor.get_id(),
                    'type':      sensor.get_type(),
                    'unit':      sensor.get_unit(),
                }
                data['sensors'].append(sensor_data)
                self.__csv_file.write_row([timestamp, sensor_data['sensor_id'], sensor_data['type'], sensor_data['value'], sensor_data['unit']])
                logger.trace('SENSOR %s#%s at %s: %s' % (sensor_data['type'], sensor_data['sensor_id'], timestamp, self.format_sensor_value(sensor_data['value'])))

            self.__sensors_data.append(data)

            if self.on_new_sensor_data_listener:
                self.on_new_sensor_data_listener(data)
        else:
            time.sleep(0.05)
