<img width="350" src="logo.png" align="right" />

# Fomalhaut
> From TEIDESAT Project and Hyperspace Canarias

> Version 0.0.0-alpha

## Description

This software is designed as a general purpose cross-platform application for the TeideSat Project. The interface (`node-client`)
will connect to the local server (`python-server`) by default or any other remote server (_note, for debugging purposes, the
interface can be accessed through the browser_).

Its currently implemented features range from:
  - Camera analysis
  - Satellite tracking
  - Sensor monitoring (sensors are not available for all platforms)
  - Logging view (mostly for remote server)
  - Logging to file (server)

This software was originally designed to run on the emitter and receiver dummies (ground segment validation experiment).The
following w1 thermal sensor devices are supported:
- DS18S20
- DS1822
- DS18B20
- DS28EA00
- DS1825/MAX31850K

The humidity and temperature sensor DHT22, I2C sensors and serial GPS(1) are also supported.

(1): to use the GPS the serial port must be open and the GPSD service must be running before the execution of the monitor server:
- Start the serial port: stty -F /dev/ttyAMA0 9600
- Start GPSD: sudo gpsd /dev/ttyAMA0 -F /var/run/gpsd.sock

## Prerequisites

- 1-wire and I2C interfaces enabled (sudo raspi-config in RBPi)
- Serial interface disabled and SPI interface enabled (sudo raspi-config in RBPi)
- Python 3.4+ with pip3 (apt install python3-pip)
- Install the following python modules (as system modules) and packages:
    - Install w1thermsensor package (pip3 install w1thermsensor)
    - Install Adafruit Python DHT Sensor Library (pip3 install Adafruit_DHT)
    - Install smbus package if not already installed (apt install python3-smbus)
    - Install dependencies for some python modules compilation (apt install libffi-dev libsrtp2-dev pkg-config)
    - Install media codecs (apt install libavdevice-dev libavfilter-dev libopus-dev libvpx-dev)
    - Install aiohttp, aiohttp_index, aiortc and opencv-python packages (pip3 install aiohttp aiohttp_index aiortc opencv-python)
    - Install gpsd gpsd-clients and python-gps packages (apt install gpsd gpsd-clients python-gps)
    - Install colorama package (pip3 install colorama)
    - Install serial and pynmea2 package (pip3 install serial pynmea2)

Note that aiortc can be installed in windows [link](https://github.com/aiortc/aiortc/issues/50#issuecomment-487478284)

## Tools and resources used

- [Electron](https://electronjs.org)
- [smbus](http://www.lm-sensors.org/browser/i2c-tools/trunk/py-smbus/)
- [w1thermsensor](https://github.com/timofurrer/w1thermsensor)
- [Adafruit Python DHT Sensor](https://github.com/adafruit/Adafruit_Python_DHT)
- [aiohttp](https://github.com/aio-libs/aiohttp)
- [aiortc](https://github.com/aiortc/aiortc)
