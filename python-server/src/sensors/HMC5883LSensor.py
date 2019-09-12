from src.sensors.I2CSensor import I2CSensor


class HMC5883LSensor(I2CSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id=sensor_id, address=0x1E, value_reg=0x03, value_reg_size=6, config_reg=0x00)

    def configure_sensor(self, bus, address, config_reg):
        # Configuration register A (01110000)
        bus.write_byte_data(address, config_reg, 0x70)

        # Configuration register B (00100000)
        bus.write_byte_data(address, config_reg + 1, 0x20)

        # Mode register (continuous)
        bus.write_byte_data(address, config_reg + 2, 0x00)

    def parse_data(self, data):
        value = [0, 0, 0]

        # X axis
        value[0] = super().cpl2(data[0] * 256 + data[1], 16)

        # Y axis
        value[1] = super().cpl2(data[2] * 256 + data[3], 16)

        # Z axis
        value[2] = super().cpl2(data[4] * 256 + data[5], 16)

        return value

    def get_type(self):
        return 'compass'
