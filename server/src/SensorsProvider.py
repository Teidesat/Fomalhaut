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
            self.__id = sensor_id

        def get_id(self):
            return self.__id

        @staticmethod
        def get_value():
            return uniform(1, 2)

        @staticmethod
        def get_type():
            return 'voltage'
    # -------------------------------------------

    @staticmethod
    def get_available_sensors(simulate=False):
        sensors = []
        if not simulate:
            from w1thermsensor import W1ThermSensor
            from src.CPUTempSensor import CPUTempSensor
            from src.MMA8451QSensor import MMA8451QSensor

            # 1wire temperature sensors
            sensors.extend(W1ThermSensor.get_available_sensors())

            # CPU temperature sensor
            sensors.append(CPUTempSensor('cpu_temperature'))

            # I2C sensors (TODO: add more I2C sensors)
            sensors.extend([MMA8451QSensor('acelerometer 1')])
        else:
            sensors.extend([SensorsProvider.FakeTemperatureSensor(53245), SensorsProvider.FakeTemperatureSensor(62346), SensorsProvider.FakeVoltageSensor(51745)])

        return sensors
