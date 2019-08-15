<img width="200" src="https://hyperspacegroup.com/wp-content/uploads/teidesat-logo-big.png" align="right" />

# Local and remote monitoring for the dummies
> TeideSAT project

## Introduction

Raspberry Pi monitor server.

This software is designed to run on the emitter and receiver of concept tests on land, its main function is to monitor them using the data provided by the different sensors and send the data to the control panel for storage and further analysis.

The following w1 therm sensor devices are supported:
- DS18S20
- DS1822
- DS18B20
- DS28EA00
- DS1825/MAX31850K

The humidity and temperature sensor DHT22 and I2C sensors are also supported.

## Prerequisites

- Python 3.4+
- (For w1thermsensor) On the Raspberry Pi, add dtoverlay=w1-gpio (for regular connection) or dtoverlay=w1-gpio,pullup="y" (for parasitic connection) to /boot/config.txt. The default data pin is GPIO4 (RaspPi connector pin 7), but that can be changed from 4 to x with dtoverlay=w1-gpio,gpiopin=x
- Install w1thermsensor package (pip install w1thermsensor)
- Install Adafruit Python DHT Sensor Library (sudo pip install Adafruit_DHT)
- Install smbus package if not already installed (apt install python3-smbus)
- Install media codecs (apt install libavdevice-dev libavfilter-dev libopus-dev libvpx-dev pkg-config)
- Install aiohttp, aiortc and opencv-python packages (pip install aiohttp aiortc opencv-python)

## Tools and resources used

- [w1thermsensor](https://github.com/timofurrer/w1thermsensor)
- [Adafruit Python DHT Sensor](https://github.com/adafruit/Adafruit_Python_DHT)
- [aiohttp](https://github.com/aio-libs/aiohttp)
- [aiortc](https://github.com/aiortc/aiortc)
