from gpiozero import CPUTemperature
from src.Sensor import Sensor


class CPUTempSensor(Sensor):

    def __init__(self, sensor_id):
        self.__cpu = CPUTemperature()
        super().__init__(sensor_id=sensor_id)

    def get_value(self):
        return self.__cpu.temperature

    @staticmethod
    def get_type():
        return 'temperature'
