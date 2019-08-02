from src.I2CSensor import I2CSensor


class MMA8452QSensor(I2CSensor):

    def __init__(self):
        super().__init__(address=0x1C, value_reg=0x00, value_reg_size=7, config_reg=0x2A)

    @staticmethod
    def configure_sensor(bus, address, config_reg):
        bus.write_byte_data(address, config_reg, 0x01)
        bus.write_byte_data(address, 0x0E, 0x00)

    @staticmethod
    def parse_data(data):
        value = [0, 0 ,0]

        # X axis
        value[0] = (data[1] * 256 + data[2]) / 16
        if value[0] > 2047 :
            value[0] -= 4096

        # Y axis
        value[1] = (data[3] * 256 + data[4]) / 16
        if value[1] > 2047 :
            value[1] -= 4096

        # Z axis
        value[2] = (data[5] * 256 + data[6]) / 16
        if value[2] > 2047 :
            value[2] -= 4096

        return value

    @staticmethod
    def get_id():
        return 'accelerometer 1'

    @staticmethod
    def get_type():
        return 'accelerometer'
