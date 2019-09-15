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
            return [msg.lat, msg.lat_dir, msg.lon, msg.lon_dir, msg.altitude, msg.altitude_units]

        return []

    def get_type(self):
        return 'gps'
