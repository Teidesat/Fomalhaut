from src.Sensor import Sensor


class CPUTempSensor(Sensor):

    def __init__(self, sensor_id):
        self.__temp_file = open('/sys/class/thermal/thermal_zone0/temp')
        super().__init__(sensor_id=sensor_id)

    def get_value(self):
        return float(self.__temp_file.read()) / 1000

    def get_type(self):
        return 'temperature'
