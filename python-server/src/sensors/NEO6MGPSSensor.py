from src.sensors.BaseSensor import BaseSensor
import serial
import pynmea2


class NEO6MGPSSensor(BaseSensor):

    def __init__(self, sensor_id):
        self.__serialPort = serial.Serial("/dev/ttyAMA0", 9600, timeout=0.5)
        super().__init__(sensor_id=sensor_id)

    def get_value(self):
        str = self.__serialPort.readline()
        if str.find('GGA') > 0:
            msg = pynmea2.parse(str)
            assert(msg.altitude_units == 'M')
            return [str(msg.lat) + msg.lat_dir, str(msg.lon) + msg.lon_dir, msg.altitude]

        return []

    def get_type(self):
        return ['latitude', 'longitude', 'altitude']

    def get_unit(self):
        return ['', '', 'm']
