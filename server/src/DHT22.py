import Adafruit_DHT as dht
from src.Sensor import Sensor


class DHT22(Sensor):

    def __init__(self, sensor_id):
        self.gpio_pin = 4
        super().__init__(sensor_id=sensor_id)

    def get_value(self):
        return dht.read_retry(dht.DHT22, self.gpio_pin)

    def get_type(self):
        return 'humidity'
