import time
from src.I2CSensor import I2CSensor


class BMP180(I2CSensor):

    def __init__(self, sensor_id):
        self.oss = 3
        self.sea_level_pressure = 1013.25
        self.ac1 = 0
        self.ac2 = 0
        self.ac3 = 0
        self.ac4 = 0
        self.ac5 = 0
        self.ac6 = 0
        self.b1 = 0
        self.b2 = 0
        self.mb = 0
        self.mc = 0
        self. md = 0
        super().__init__(sensor_id=sensor_id, address=0x77, value_reg=0xF6, config_reg=0xF4)

    def configure_sensor(self, bus, address, config_reg):
        calibration_data = bus.read_i2c_block_data(address, 0xAA, 22)
        self.ac1 = (calibration_data[0] << 8) + calibration_data[1]
        self.ac2 = (calibration_data[2] << 8) + calibration_data[3]
        self.ac3 = (calibration_data[4] << 8) + calibration_data[5]
        self.ac4 = (calibration_data[6] << 8) + calibration_data[7]
        self.ac5 = (calibration_data[8] << 8) + calibration_data[9]
        self.ac6 = (calibration_data[10] << 8) + calibration_data[11]
        self.b1 = (calibration_data[12] << 8) + calibration_data[13]
        self.b2 = (calibration_data[14] << 8) + calibration_data[15]
        self.mb = (calibration_data[16] << 8) + calibration_data[17]
        self.mc = (calibration_data[18] << 8) + calibration_data[19]
        self. md = (calibration_data[20] << 8) + calibration_data[21]

    def get_value(self):
        # Start temperature measurement (4.5 ms)
        self.get_bus().write_byte_data(self.address, self.config_reg, 0x2E)

        # Wait 50 ms
        time.sleep(.05)

        data = self.get_bus().read_i2c_block_data(self.address, self.value_reg, 2)
        ut = (data[0] << 8) + data[1]

        # Start pressure measurement (max 25.5 ms)
        self.get_bus().write_byte_data(self.address, self.config_reg, 0x34 + (self.oss << 6))

        # Wait 50 ms
        time.sleep(.05)

        data = self.get_bus().read_i2c_block_data(self.address, self.value_reg, 3)
        up = ((data[0] << 16) + (data[1] << 8) + data[2]) >> (8 - self.oss)

        return self.parse_data([ut, up])

    def parse_data(self, data):
        cdata = [0, 0, 0]

        cdata[0] = self.calculate_temperature(data[0])
        cdata[1] = self.calculate_pressure(data[0], data[1])
        cdata[2] = self.calculate_altitude(cdata[1])

        return cdata

    def calculate_b5(self, ut):
        x1 = (ut - self.ac6) * self.ac5 / 2**15
        x2 = self.mc * 2**11 / (x1 + self.md)
        return x1 + x2

    def calculate_temperature(self, ut):
        return ((self.calculate_b5(ut) + 8) / 2**4) / 10

    def calculate_pressure(self, up, ut):
        b6 = self.calculate_b5(ut) - 4000
        x1 = (self.b2 * (b6 * b6 / 2**12)) / 2**11
        x2 = self.ac2 * b6 / 2**11
        x3 = x1 + x2
        b3 = (((self.ac1 * 4 + x3) << self.oss) + 2) / 4
        x1 = self.ac3 * b6 / 2**13
        x2 = (self.b1 * (b6 * b6 / 2**12)) / 2**16
        x3 = ((x1 + x2) + 2) / 2**2
        b4 = self.ac4 * (x3 + 32768) / 2**15
        b7 = (up - b3) * (50000 >> self.oss)
        if b7 < 0x80000000:
            p = (b7 * 2) / b4
        else:
            p = (b7 / b4) * 2
        x1 = (p / 2**8) * (p / 2**8)
        x1 = (x1 * 3038) / 2**16
        x2 = (-7357 * p) / 2**16
        return (p + (x1 + x2 + 3791) / 2**4) / 100

    def calculate_altitude(self, p):
        return 44330 * (1 - (p / self.sea_level_pressure)**(1/5.255))

    def get_type(self):
        return 'barometer'
