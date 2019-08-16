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

- Raspberry Pi with a recent version of Raspbian and 1-wire and I2C interfaces enabled (sudo raspi-config)
- Python 3.4+ with pip3 (apt install python3-pip)
- Install the following python modules (as system modules) and packages:
    - Install w1thermsensor package (pip3 install w1thermsensor)
    - Install gpiozero package (pip3 install gpiozero)
    - Install Adafruit Python DHT Sensor Library (pip3 install Adafruit_DHT)
    - Install smbus package if not already installed (apt install python3-smbus)
    - Install dependencies for some python modules compilation (apt install libffi-dev libsrtp2-dev pkg-config)
    - Install media codecs (apt install libavdevice-dev libavfilter-dev libopus-dev libvpx-dev)
    - Install aiohttp, aiohttp_index, aiortc and opencv-python packages (pip3 install aiohttp aiohttp_index aiortc)
    - Install colorama package (pip3 install colorama)

## Tools and resources used

- [smbus](http://www.lm-sensors.org/browser/i2c-tools/trunk/py-smbus/)
- [w1thermsensor](https://github.com/timofurrer/w1thermsensor)
- [Adafruit Python DHT Sensor](https://github.com/adafruit/Adafruit_Python_DHT)
- [aiohttp](https://github.com/aio-libs/aiohttp)
- [aiortc](https://github.com/aiortc/aiortc)
