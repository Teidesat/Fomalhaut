from src.sensors.I2CSensor import I2CSensor


class MPU6050Sensor(I2CSensor):
    # Global Variables
    GRAVITIY_MS2 = 9.80665

    # Scale Modifiers
    ACCEL_SCALE_MODIFIER_2G = 16384.0
    ACCEL_SCALE_MODIFIER_4G = 8192.0
    ACCEL_SCALE_MODIFIER_8G = 4096.0
    ACCEL_SCALE_MODIFIER_16G = 2048.0

    GYRO_SCALE_MODIFIER_250DEG = 131.0
    GYRO_SCALE_MODIFIER_500DEG = 65.5
    GYRO_SCALE_MODIFIER_1000DEG = 32.8
    GYRO_SCALE_MODIFIER_2000DEG = 16.4

    # Pre-defined ranges
    ACCEL_RANGE_2G = 0x00
    ACCEL_RANGE_4G = 0x08
    ACCEL_RANGE_8G = 0x10
    ACCEL_RANGE_16G = 0x18

    GYRO_RANGE_250DEG = 0x00
    GYRO_RANGE_500DEG = 0x08
    GYRO_RANGE_1000DEG = 0x10
    GYRO_RANGE_2000DEG = 0x18

    # MPU-6050 Registers
    PWR_MGMT_1 = 0x6B
    PWR_MGMT_2 = 0x6C

    ACCEL_XOUT0 = 0x3B
    ACCEL_YOUT0 = 0x3D
    ACCEL_ZOUT0 = 0x3F

    TEMP_OUT0 = 0x41

    GYRO_XOUT0 = 0x43
    GYRO_YOUT0 = 0x45
    GYRO_ZOUT0 = 0x47

    ACCEL_CONFIG = 0x1C
    GYRO_CONFIG = 0x1B

    def __init__(self, sensor_id):
        super().__init__(sensor_id=sensor_id, address=0x68)

    def get_value(self):
        temp = self.__get_temp()
        accel = self.__get_accel_data()
        gyro = self.__get_gyro_data()

        return accel + gyro + [temp]

    def parse_data(self, data):
        return super().parse_data(data)

    def configure_sensor(self, bus, address, config_reg):
        self.get_bus().write_byte_data(self.address, self.PWR_MGMT_1, 0x00)
        self.__set_gyro_range(self.GYRO_RANGE_500DEG)
        self.__set_accel_range(self.ACCEL_RANGE_4G)

    def get_type(self):
        return ['accelerometer_x', 'accelerometer_y', 'accelerometer_z',
                'gyro_x', 'gyro_y', 'gyro_z',
                'temperature']

    def get_unit(self):
        return ['g', 'g', 'g', '°', '°', '°', 'ºC']

    def __read_i2c_word(self, register):
        high = self.get_bus().read_byte_data(self.address, register)
        low = self.get_bus().read_byte_data(self.address, register + 1)

        value = (high << 8) + low

        if value >= 0x8000:
            return -((65535 - value) + 1)
        else:
            return value

    def __get_temp(self):
        raw_temp = self.__read_i2c_word(self.TEMP_OUT0)
        actual_temp = (raw_temp / 340.0) + 36.53
        return actual_temp

    def __set_accel_range(self, accel_range):
        self.get_bus().write_byte_data(self.address, self.ACCEL_CONFIG, accel_range)

    def __read_accel_range(self, raw=False):
        raw_data = self.get_bus().read_byte_data(self.address, self.ACCEL_CONFIG)

        if raw is True:
            return raw_data
        elif raw is False:
            if raw_data == self.ACCEL_RANGE_2G:
                return 2
            elif raw_data == self.ACCEL_RANGE_4G:
                return 4
            elif raw_data == self.ACCEL_RANGE_8G:
                return 8
            elif raw_data == self.ACCEL_RANGE_16G:
                return 16
            else:
                return -1

    def __get_accel_data(self, g=False):
        x = self.__read_i2c_word(self.ACCEL_XOUT0)
        y = self.__read_i2c_word(self.ACCEL_YOUT0)
        z = self.__read_i2c_word(self.ACCEL_ZOUT0)

        accel_range = self.__read_accel_range(True)

        if accel_range == self.ACCEL_RANGE_2G:
            accel_scale_modifier = self.ACCEL_SCALE_MODIFIER_2G
        elif accel_range == self.ACCEL_RANGE_4G:
            accel_scale_modifier = self.ACCEL_SCALE_MODIFIER_4G
        elif accel_range == self.ACCEL_RANGE_8G:
            accel_scale_modifier = self.ACCEL_SCALE_MODIFIER_8G
        elif accel_range == self.ACCEL_RANGE_16G:
            accel_scale_modifier = self.ACCEL_SCALE_MODIFIER_16G
        else:
            accel_scale_modifier = self.ACCEL_SCALE_MODIFIER_2G

        x = x / accel_scale_modifier
        y = y / accel_scale_modifier
        z = z / accel_scale_modifier

        if g is True:
            return [x, y, z]
        elif g is False:
            x = x * self.GRAVITIY_MS2
            y = y * self.GRAVITIY_MS2
            z = z * self.GRAVITIY_MS2
            return [x, y, z]

    def __set_gyro_range(self, gyro_range):
        self.get_bus().write_byte_data(self.address, self.GYRO_CONFIG, gyro_range)

    def __read_gyro_range(self, raw=False):
        raw_data = self.get_bus().read_byte_data(self.address, self.GYRO_CONFIG)

        if raw is True:
            return raw_data
        elif raw is False:
            if raw_data == self.GYRO_RANGE_250DEG:
                return 250
            elif raw_data == self.GYRO_RANGE_500DEG:
                return 500
            elif raw_data == self.GYRO_RANGE_1000DEG:
                return 1000
            elif raw_data == self.GYRO_RANGE_2000DEG:
                return 2000
            else:
                return -1

    def __get_gyro_data(self):
        x = self.__read_i2c_word(self.GYRO_XOUT0)
        y = self.__read_i2c_word(self.GYRO_YOUT0)
        z = self.__read_i2c_word(self.GYRO_ZOUT0)

        gyro_range = self.__read_gyro_range(True)

        if gyro_range == self.GYRO_RANGE_250DEG:
            gyro_scale_modifier = self.GYRO_SCALE_MODIFIER_250DEG
        elif gyro_range == self.GYRO_RANGE_500DEG:
            gyro_scale_modifier = self.GYRO_SCALE_MODIFIER_500DEG
        elif gyro_range == self.GYRO_RANGE_1000DEG:
            gyro_scale_modifier = self.GYRO_SCALE_MODIFIER_1000DEG
        elif gyro_range == self.GYRO_RANGE_2000DEG:
            gyro_scale_modifier = self.GYRO_SCALE_MODIFIER_2000DEG
        else:
            gyro_scale_modifier = self.GYRO_SCALE_MODIFIER_250DEG

        x = x / gyro_scale_modifier
        y = y / gyro_scale_modifier
        z = z / gyro_scale_modifier

        return [x, y, z]
