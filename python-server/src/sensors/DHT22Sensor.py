import time
import Adafruit_DHT as dht
from src.sensors.BaseSensor import BaseSensor


class DHT22Sensor(BaseSensor):

    def __init__(self, sensor_id):
        self.gpio_pin = 18
        humidity, temp = dht.read_retry(dht.DHT22, self.gpio_pin)
        if humidity is None or temp is None:
            raise Exception('Unable to connect')
        super().__init__(sensor_id=sensor_id)

    def get_value(self):
        humidity, temp = dht.read(dht.DHT22, self.gpio_pin)
        if humidity is None or temp is None:
            time.sleep(.200)
            return list(dht.read(dht.DHT22, self.gpio_pin))
        else:
            return [humidity, temp]

    def get_type(self):
        return 'humidity'
