import smbus
from abc import abstractmethod
from src.Sensor import Sensor


class I2CSensor(Sensor):

    def __init__(self, sensor_id, i2c_ch=1, address=0x00, value_reg=0x00, value_reg_size=2, config_reg=0x01):
        self.__bus = smbus.SMBus(i2c_ch)
        self.address = address
        self.value_reg = value_reg
        self.config_reg = config_reg
        self.value_reg_size = value_reg_size
        self.configure_sensor(self.__bus, self.address, self.config_reg)
        super().__init__(sensor_id=sensor_id)

    def get_bus(self):
        return self.__bus

    def get_value(self):
        data = self.get_bus().read_i2c_block_data(self.address, self.value_reg, self.value_reg_size)
        return self.parse_data(data)

    @abstractmethod
    def parse_data(self, data):
        return data

    @abstractmethod
    def configure_sensor(self, bus, address, config_reg):
        pass

    @staticmethod
    def cpl2(value, bits):
        if (value & (1 << (bits - 1))) != 0:
            cpl2_value = value - (1 << bits)
        else:
            cpl2_value = value
        return cpl2_value
