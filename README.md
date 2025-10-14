# Fomalhaut

[![npm 11](https://img.shields.io/badge/npm-11-blue.svg)](https://nodejs.org/es/download/)
[![node 22](https://img.shields.io/badge/node-22-blue.svg)](https://nodejs.org/es/download/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green.svg)](https://www.gnu.org/licenses/gpl-3.0)
![Version](https://img.shields.io/badge/alpha-0.0.0-yellow.svg)

> From TEIDESAT Project and Hyperspace Canarias

![Home screen shot](src/assets/homeScreenShot.png)

## Documentation

[UML Documentation](https://drive.google.com/file/d/13AXM-qIjfROxe5EaNRkCwk9KPloPaoG-/view?usp=sharing)

## Description

This software is designed as a general purpose cross-platform application for the TeideSat Project. The interface (`React`)
will connect to the local server (`java-spring`) by default or any other remote server (_note, for debugging purposes, the
interface can be accessed through the browser_).

## Developed Features

![Communications screen shot](src/assets/CommunicationsScreenShot.png)

![Location screen shot](src/assets/LocationScreenShot.png)

## Usage

`git clone https://github.com/Teidesat/Fomalhaut.git`

`cd Fomalhaut`

`npm install`

`npm run dev`

## Usage (Docker)

`git clone https://github.com/Teidesat/Fomalhaut.git`

`cd Fomalhaut`

`docker build -t fomalhaut-frontend .`

`docker run -it --rm -p 20001:20001 fomalhaut-frontend npm run dev -- --host 0.0.0.0`

Presiona **`Ctrl + C`** en la terminal donde se está ejecutando el contenedor.
