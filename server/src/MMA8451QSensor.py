from src.I2CSensor import I2CSensor


class MMA8451QSensor(I2CSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id=sensor_id, address=0x1C, value_reg=0x00, value_reg_size=7, config_reg=0x2A)

    @staticmethod
    def configure_sensor(bus, address, config_reg):
        # Disable FIFO
        bus.write_byte_data(address, 0x09, 0x00)

        # Value range = 2g, disable high pass output data
        bus.write_byte_data(address, 0x0E, 0x00)

        # ODR = 800 Hz, ACTIVE
        bus.write_byte_data(address, config_reg, 0x01)

    @staticmethod
    def parse_data(data):
        value = [0, 0, 0]

        # X axis
        value[0] = super().cpl2((data[1] * 256 + data[2]) / 4, 14)

        # Y axis
        value[1] = super().cpl2((data[3] * 256 + data[4]) / 4, 14)

        # Z axis
        value[2] = super().cpl2((data[5] * 256 + data[6]) / 4, 14)

        return value

    @staticmethod
    def get_type():
        return 'accelerometer'
