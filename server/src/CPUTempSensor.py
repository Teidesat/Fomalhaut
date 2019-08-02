from gpiozero import CPUTemperature
from src.Sensor import Sensor


class CPUTempSensor(Sensor):

    def __init__(self):
        self.__cpu = CPUTemperature()

    @staticmethod
    def get_id():
        return 'cpu_temperature'

    def get_value(self):
        return self.__cpu.temperature

    @staticmethod
    def get_type():
        return 'temperature'
