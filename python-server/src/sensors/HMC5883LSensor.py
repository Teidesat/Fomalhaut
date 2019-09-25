from src.sensors.I2CSensor import I2CSensor


class HMC5883LSensor(I2CSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id=sensor_id, address=0x1E, value_reg=0x03, value_reg_size=6, config_reg=0x00)

    def configure_sensor(self, bus, address, config_reg):
        # Configuration register A
        bus.write_byte_data(address, config_reg, 0x60)

        # Mode register (continuous)
        bus.write_byte_data(address, config_reg + 2, 0x00)

    def parse_data(self, data):
        value = [0, 0, 0]

        # X axis
        value[0] = data[0] * 256 + data[1]
        if value[0] > 32767:
            value[0] -= 65536

        # Z axis
        value[2] = data[2] * 256 + data[3]
        if value[2] > 32767:
            value[2] -= 65536

        # Y axis
        value[1] = data[4] * 256 + data[5]
        if value[1] > 32767:
            value[1] -= 65536

        return value

    def get_type(self):
        return 'compass'

    def get_unit(self):
        return 'gauss'
