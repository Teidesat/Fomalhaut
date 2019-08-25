from abc import ABC, abstractmethod


class Sensor(ABC):

    def __init__(self, sensor_id):
        self.__id = sensor_id

    def get_id(self):
        return self.__id

    @abstractmethod
    def get_value(self):
        pass

    @abstractmethod
    def get_type(self):
        pass
