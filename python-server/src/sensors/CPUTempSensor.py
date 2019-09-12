from src.sensors.BaseSensor import BaseSensor


class CPUTempSensor(BaseSensor):

    def __init__(self, sensor_id):
        self.__temp_file = open('/sys/class/thermal/thermal_zone0/temp', 'r')
        super().__init__(sensor_id=sensor_id)

    def get_value(self):
        self.__temp_file.seek(0)
        return float(self.__temp_file.read()) / 1000

    def get_type(self):
        return 'temperature'
