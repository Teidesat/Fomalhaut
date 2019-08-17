from random import uniform
from src.Sensor import Sensor
from src.Logger import Logger


class SensorsProvider:
    # ----------- ONLY FOR SIMULATION -----------
    class FakeTemperatureSensor(Sensor):

        def __init__(self, sensor_id):
            super().__init__(sensor_id)

        def get_value(self):
            return uniform(12, 60)

        def get_type(self):
            return 'temperature'

    class FakeHumiditySensor(Sensor):

        def __init__(self, sensor_id):
            super().__init__(sensor_id)

        def get_value(self):
            return [uniform(20, 95), uniform(12, 60)]

        def get_type(self):
            return 'humidity'

    class FakeVoltageSensor(Sensor):

        def __init__(self, sensor_id):
            super().__init__(sensor_id)

        def get_value(self):
            return uniform(1, 2)

        def get_type(self):
            return 'voltage'

    # -------------------------------------------

    @staticmethod
    def get_available_sensors(simulate=False, logger=None):
        sensors = []
        if not simulate:
            from w1thermsensor import W1ThermSensor
            from src.DS18B20Sensor import DS18B20Sensor
            from src.CPUTempSensor import CPUTempSensor
            from src.MMA8451QSensor import MMA8451QSensor
            from src.HMC5883LSensor import HMC5883LSensor
            from src.BMP180Sensor import BMP180Sensor
            from src.DHT22Sensor import DHT22Sensor

            # 1wire DS18B20 temperature sensors
            for i, sensor in enumerate(W1ThermSensor.get_available_sensors([W1ThermSensor.THERM_SENSOR_DS18B20])):
                sensor = DS18B20Sensor(sensor_id='temperature %d' % i, sensor=sensor)
                SensorsProvider.__log(logger, 'Loading \'%s\' sensor...' % sensor.get_id(), Logger.LogLevel.INFO)
                sensors.append(sensor)
                SensorsProvider.__log(logger, 'Loaded \'%s\' sensor' % sensor.get_id(), Logger.LogLevel.INFO)

            SensorsProvider.__add_sensor(CPUTempSensor, sensors, 'CPU temperature', logger)
            SensorsProvider.__add_sensor(MMA8451QSensor, sensors, 'accelerometer', logger)
            SensorsProvider.__add_sensor(HMC5883LSensor, sensors, 'compass', logger)
            SensorsProvider.__add_sensor(BMP180Sensor, sensors, 'barometer', logger)
            SensorsProvider.__add_sensor(DHT22Sensor, sensors, 'humidity and temperature', logger)
            # I2C sensors (TODO: add more I2C sensors)

        else:
            sensors.extend([SensorsProvider.FakeTemperatureSensor(53245), SensorsProvider.FakeTemperatureSensor(62346),
                            SensorsProvider.FakeVoltageSensor(51745), SensorsProvider.FakeHumiditySensor(32344)])

        return sensors

    @staticmethod
    def __add_sensor(sensor, sensors, name, logger):
        try:
            SensorsProvider.__log(logger, 'Loading \'%s\' sensor...' % name, Logger.LogLevel.INFO)
            sensors.append(sensor(name))
            SensorsProvider.__log(logger, 'Loaded \'%s\' sensor' % name, Logger.LogLevel.INFO)
        except:
            SensorsProvider.__log(logger, 'Failed to load \'%s\' sensor' % name, Logger.LogLevel.WARNING)

    @staticmethod
    def __log(logger, msg, level):
        if logger is not None:
            logger.log(msg, level)
