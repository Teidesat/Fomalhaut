from src.Sensor import Sensor


class DS18B20Sensor(Sensor):

    def __init__(self, sensor_id, sensor):
        self.__sensor = sensor
        super().__init__(sensor_id=sensor_id)

    def get_value(self):
        return self.__sensor.get_temperature()

    def get_type(self):
        return 'temperature'

    def get_id(self):
        return super().get_id() + ' (%s)' % self.__sensor.id
