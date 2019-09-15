from random import uniform
from src.sensors.BaseSensor import BaseSensor

class FakeBMP180Sensor(BaseSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id)

    def get_value(self):
        return [uniform(12, 60), uniform(800, 1100), uniform(100, 200)]

    def get_type(self):
        return ['temperature', 'pressure', 'altitude']

    def get_unit(self):
        return ['ºC', 'mb', 'm']

class FakeDS18B20Sensor(BaseSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id)

    def get_value(self):
        return uniform(12, 60)

    def get_type(self):
        return 'temperature'

    def get_unit(self):
        return 'ºC'

class FakeDHT22Sensor(BaseSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id)

    def get_value(self):
        return [uniform(20, 95), uniform(12, 60)]

    def get_type(self):
        return ['humidity', 'temperature']

    def get_unit(self):
        return ['%', 'ºC']

class FakeHMC5883LSensor(BaseSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id)

    def get_value(self):
        return [uniform(-180, 180), uniform(-180, 180), uniform(-180, 180)]

    def get_type(self):
        return 'compass'

    def get_unit(self):
        return '°'

class FakeMMA8451QSensor(BaseSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id)

    def get_value(self):
        return [uniform(-2, 2), uniform(-2, 2), uniform(-2, 2)]

    def get_type(self):
        return 'accelerometer'

    def get_unit(self):
        return 'g'

class FakeMPU6050Sensor(BaseSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id)

    def get_value(self):
        return [
                    [uniform(-2, 2), uniform(-2, 2), uniform(-2, 2)],
                    [uniform(-180, 180), uniform(-180, 180), uniform(-180, 180)],
                    uniform(12, 60)
                ]

    def get_type(self):
        return ['accelerometer', 'gyro', 'temperature']

    def get_unit(self):
        return ['g', '°', 'ºC']

class FakeNEO6MGPSSensor(BaseSensor):

    def __init__(self, sensor_id):
        super().__init__(sensor_id)

    def get_value(self):
        return ['29.959694S', '14.632805W', uniform(100, 200)]

    def get_type(self):
        return ['latitude', 'longitude', 'altitude']

    def get_unit(self):
        return ['', '', 'm']

default_fakes = [
    FakeBMP180Sensor(28572),
    FakeDS18B20Sensor(53245),
    FakeDS18B20Sensor(25417),
    FakeDHT22Sensor(62346),
    FakeHMC5883LSensor(51745),
    FakeMMA8451QSensor(74832),
    FakeMPU6050Sensor(49300),
    FakeNEO6MGPSSensor(91784),
]
