from random import uniform
from src.Sensor import Sensor


class SensorsProvider:

    # ----------- ONLY FOR SIMULATION -----------
    class FakeTemperatureSensor:

        def __init__(self, sensor_id):
            self.id = sensor_id

        @staticmethod
        def get_temperature():
            return uniform(12, 60)

    class FakeVoltageSensor(Sensor):

        def __init__(self, sensor_id):
            super().__init__(sensor_id)

        def get_value(self):
            return uniform(1, 2)

        def get_type(self):
            return 'voltage'
    # -------------------------------------------

    @staticmethod
    def get_available_sensors(simulate=False):
        sensors = []
        if not simulate:
            from w1thermsensor import W1ThermSensor
            from src.CPUTempSensor import CPUTempSensor
            from src.MMA8451QSensor import MMA8451QSensor
            from src.HMC5883L import HMC5883L
            from src.BMP180 import BMP180
            from src.DHT22 import DHT22

            # 1wire DS18B20 temperature sensors
            sensors.extend(W1ThermSensor.get_available_sensors([W1ThermSensor.THERM_SENSOR_DS18B20]))

            # CPU temperature sensor
            sensors.append(CPUTempSensor('cpu temperature'))

            # I2C sensors (TODO: add more I2C sensors)
            sensors.extend([MMA8451QSensor('accelerometer 1'), HMC5883L('compass 1'), BMP180('barometer 1'), DHT22('humidity 1')])
        else:
            sensors.extend([SensorsProvider.FakeTemperatureSensor(53245), SensorsProvider.FakeTemperatureSensor(62346), SensorsProvider.FakeVoltageSensor(51745)])

        return sensors
