from abc import ABC, abstractmethod


class Sensor(ABC):

    @abstractmethod
    def get_id(self):
        pass

    @abstractmethod
    def get_value(self):
        pass

    @abstractmethod
    def get_type(self):
        pass
