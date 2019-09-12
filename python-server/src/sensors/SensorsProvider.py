from random import uniform
from src.sensors.BaseSensor import BaseSensor
from src.utils.Logger import Logger


class SensorsProvider:
    # ----------- ONLY FOR SIMULATION -----------
    class FakeTemperatureSensor(BaseSensor):

        def __init__(self, sensor_id):
            super().__init__(sensor_id)

        def get_value(self):
            return uniform(12, 60)

        def get_type(self):
            return 'temperature'

    class FakeHumiditySensor(BaseSensor):

        def __init__(self, sensor_id):
            super().__init__(sensor_id)

        def get_value(self):
            return [uniform(20, 95), uniform(12, 60)]

        def get_type(self):
            return 'humidity'

    class FakeVoltageSensor(BaseSensor):

        def __init__(self, sensor_id):
            super().__init__(sensor_id)

        def get_value(self):
            return uniform(1, 2)

        def get_type(self):
            return 'voltage'

    # -------------------------------------------

    @staticmethod
    def try_import_sensor_module(module_name, sensor_name, logger):
        ok = False
        try:
            sensor = getattr(__import__(module_name), sensor_name)
            logger.log('Loaded module for \'%s\'' % sensor_name, Logger.LogLevel.DEBUG)
            ok = True
        except:
            logger.log('Couldnt load module for \'%s\' (is this Linux exclusive?)' % sensor_name, Logger.LogLevel.WARNING)
            sensor = None
        return ok, sensor

    @staticmethod
    def get_available_sensors(simulate=False, logger=None):
        sensors = []
        if not simulate:
            W1ThermSensor_ok, W1ThermSensor   = SensorsProvider.try_import_sensor_module('w1thermsensor', 'W1ThermSensor', logger)
            DS18B20Sensor_ok, DS18B20Sensor   = SensorsProvider.try_import_sensor_module('src.DS18B20Sensor', 'DS18B20Sensor', logger)
            CPUTempSensor_ok, CPUTempSensor   = SensorsProvider.try_import_sensor_module('src.CPUTempSensor', 'CPUTempSensor', logger)
            MMA8451QSensor_ok, MMA8451QSensor = SensorsProvider.try_import_sensor_module('src.MMA8451QSensor', 'MMA8451QSensor', logger)
            HMC5883LSensor_ok, HMC5883LSensor = SensorsProvider.try_import_sensor_module('src.HMC5883LSensor', 'HMC5883LSensor', logger)
            BMP180Sensor_ok, BMP180Sensor     = SensorsProvider.try_import_sensor_module('src.BMP180Sensor', 'BMP180Sensor', logger)
            DHT22Sensor_ok, DHT22Sensor       = SensorsProvider.try_import_sensor_module('src.DHT22Sensor', 'DHT22Sensor', logger)

            if W1ThermSensor_ok:
                # All 1wire DS18B20 temperature sensors
                for i, sensor in enumerate(W1ThermSensor.get_available_sensors([W1ThermSensor.THERM_SENSOR_DS18B20])):
                    sensor = DS18B20Sensor(sensor_id='temperature %d' % i, sensor=sensor)
                    SensorsProvider.__log(logger, 'Loading \'%s\' sensor...' % sensor.get_id(), Logger.LogLevel.INFO)
                    sensors.append(sensor)
                    SensorsProvider.__log(logger, 'Loaded \'%s\' sensor' % sensor.get_id(), Logger.LogLevel.INFO)

            if CPUTempSensor_ok:  SensorsProvider.__add_sensor(CPUTempSensor, sensors, 'CPU temperature', logger)
            if MMA8451QSensor_ok: SensorsProvider.__add_sensor(MMA8451QSensor, sensors, 'accelerometer', logger)
            if HMC5883LSensor_ok: SensorsProvider.__add_sensor(HMC5883LSensor, sensors, 'compass', logger)
            if BMP180Sensor_ok:   SensorsProvider.__add_sensor(BMP180Sensor, sensors, 'barometer', logger)
            if DHT22Sensor_ok:    SensorsProvider.__add_sensor(DHT22Sensor, sensors, 'humidity and temperature', logger)
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
