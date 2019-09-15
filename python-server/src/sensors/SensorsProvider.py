from random import uniform
from src.sensors.BaseSensor import BaseSensor
from src.utils.Logger import default_logger as logger


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
    def try_import_sensor_module(module_name, sensor_name):
        ok = False
        try:
            module = __import__(module_name, fromlist=['object'])
            sensor = getattr(module, sensor_name)
            logger.debug('Loaded module for \'%s\'' % sensor_name)
            ok = True
        except Exception as e:
            logger.debug('Couldnt load module for \'%s\', %s' % (sensor_name, str(e)))
            logger.warn('Couldnt load module for \'%s\' (is this Linux exclusive?)' % sensor_name)
            sensor = None
        return ok, sensor

    @staticmethod
    def get_available_sensors(simulate=False):
        sensors = []
        if not simulate:
            DS18B20Sensor_ok, DS18B20Sensor   = SensorsProvider.try_import_sensor_module('src.sensors.DS18B20Sensor', 'DS18B20Sensor')
            W1ThermSensor_ok, W1ThermSensor   = SensorsProvider.try_import_sensor_module('w1thermsensor', 'W1ThermSensor')
            CPUTempSensor_ok, CPUTempSensor   = SensorsProvider.try_import_sensor_module('src.sensors.CPUTempSensor', 'CPUTempSensor')
            MMA8451QSensor_ok, MMA8451QSensor = SensorsProvider.try_import_sensor_module('src.sensors.MMA8451QSensor', 'MMA8451QSensor')
            HMC5883LSensor_ok, HMC5883LSensor = SensorsProvider.try_import_sensor_module('src.sensors.HMC5883LSensor', 'HMC5883LSensor')
            BMP180Sensor_ok, BMP180Sensor     = SensorsProvider.try_import_sensor_module('src.sensors.BMP180Sensor', 'BMP180Sensor')
            DHT22Sensor_ok, DHT22Sensor       = SensorsProvider.try_import_sensor_module('src.sensors.DHT22Sensor', 'DHT22Sensor')
            MPU6050Sensor_ok, MPU6050Sensor = SensorsProvider.try_import_sensor_module('src.sensors.MPU6050Sensor', 'MPU6050Sensor')
            NEO6MGPSSensor_ok, NEO6MGPSSensor = SensorsProvider.try_import_sensor_module('src.sensors.NEO6MGPSSensor', 'NEO6MGPSSensor')

            if W1ThermSensor_ok:
                # All 1wire DS18B20 temperature sensors
                for i, sensor in enumerate(W1ThermSensor.get_available_sensors([W1ThermSensor.THERM_SENSOR_DS18B20])):
                    sensor = DS18B20Sensor(sensor_id='temperature %d' % i, sensor=sensor)
                    sensors.append(sensor)
                    logger.info(logger, 'Loaded \'%s\' sensor...' % sensor.get_id())

            if CPUTempSensor_ok:  SensorsProvider.__add_sensor(CPUTempSensor, sensors, 'CPU temperature', logger)
            if MMA8451QSensor_ok: SensorsProvider.__add_sensor(MMA8451QSensor, sensors, 'accelerometer', logger)
            if HMC5883LSensor_ok: SensorsProvider.__add_sensor(HMC5883LSensor, sensors, 'compass', logger)
            if BMP180Sensor_ok:   SensorsProvider.__add_sensor(BMP180Sensor, sensors, 'barometer', logger)
            if DHT22Sensor_ok:    SensorsProvider.__add_sensor(DHT22Sensor, sensors, 'humidity and temperature', logger)
            if MPU6050Sensor_ok:    SensorsProvider.__add_sensor(MPU6050Sensor, sensors, 'accelerometer', logger)
            if NEO6MGPSSensor_ok:    SensorsProvider.__add_sensor(NEO6MGPSSensor, sensors, 'gps', logger)

        else:
            sensors.extend([SensorsProvider.FakeTemperatureSensor(53245), SensorsProvider.FakeTemperatureSensor(62346),
                            SensorsProvider.FakeVoltageSensor(51745), SensorsProvider.FakeHumiditySensor(32344)])

        return sensors

    @staticmethod
    def __add_sensor(sensor, sensors, name, logger):
        try:
            sensors.append(sensor(name))
            logger.info('Loaded \'%s\' sensor' % name)
        except:
            logger.warn('Failed to load \'%s\' sensor' % name)
