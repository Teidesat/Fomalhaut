const fs = require("fs");
const { createCanvas } = require("canvas");

const NUMBER_OF_TEXTURES = parseInt(process.argv.slice(2), 10);
const PATH = "../assets/images/textures/";

// Remove Texture PNG Files
let regex = /texture[.]png$/;
fs.readdirSync("./")
  .filter((f) => regex.test(f))
  .map((f) => fs.unlinkSync(PATH + f));

const WIDTH = 1024;
const HEIGHT = 1024;
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

const RESOLUTION = 500;
const HORIZONTAL_GAP = canvas.width / RESOLUTION;
const VERTICAL_GAP = canvas.height / RESOLUTION;

const MIN_RADIUS = 5;
const MAX_RADIUS = RESOLUTION / 4;

let temperatureMapColor;

/**
 * Main function that creates the texture PNG.
 * Calls the printSensorsRadius function.
 */
function createTempMapTexture() {
  /*
  ctx.strokeStyle = "#cdcdcd";
  ctx.lineCap = "round";

  for (let i = 0; i <= RESOLUTION; i++) {
    ctx.moveTo(HORIZONTAL_GAP * i, 0);
    ctx.lineTo(HORIZONTAL_GAP * i, canvas.height);
    ctx.stroke();
    ctx.moveTo(0, VERTICAL_GAP * i);
    ctx.lineTo(canvas.width, VERTICAL_GAP * i);
    ctx.stroke();
  }
  */

  for (let i = 0; i < NUMBER_OF_TEXTURES; i++) {
    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    temperatureMapColor = new Array(RESOLUTION)
      .fill(256)
      .map(() => new Array(RESOLUTION).fill(256));

    const GENERATED_SENSORS = getRandomSensors(8);
    printSensors(GENERATED_SENSORS);
    printSensorsRadius(GENERATED_SENSORS);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(PATH + "texture" + (i + 1) + ".png", buffer);
  }
}
/**
 * Generate N number of different sensors and returns an array including them.
 * The variables from each sensor are:
 *    x: Position in X axis.
 *    y: Position in Y axis.
 *    temperature: Random temperature inside a custom range.
 *    radius: Radius dependent on the temperature value. // Hotter -> Bigger
 *    maxColor: Color dependent on the temperature value. // Hotter -> More red
 * @param {Number} nSensors Number of different sensors to generate
 * @returns {Array}
 */
function getRandomSensors(nSensors) {
  const MIN_TEMP = 25;
  const MAX_TEMP = 90;
  let sensors = [];
  for (let i = 0; i < nSensors; i++) {
    let temp = Math.floor(Math.random() * (MAX_TEMP - MIN_TEMP + 1)) + MIN_TEMP;
    let rad = Math.floor(temp.map(MIN_TEMP, MAX_TEMP, MIN_RADIUS, MAX_RADIUS));
    sensors.push({
      x: Math.floor(Math.random() * RESOLUTION),
      y: Math.floor(Math.random() * RESOLUTION),
      temperature: temp,
      radius: rad,
      maxColor: rad.map(MIN_RADIUS, MAX_RADIUS, 100, 0),
    });
  }
  return sensors;
}

function printSensors(SENSORS) {
  // Print sensors
  ctx.fillStyle = "black";
  for (const SENSOR of SENSORS) {
    const sensorSize =
      Math.floor(RESOLUTION / 100) > 1 ? Math.floor(RESOLUTION / 100) : 1; //Min size 1
    for (let i = SENSOR.x - sensorSize; i < SENSOR.x + sensorSize; i++) {
      for (let j = SENSOR.y - sensorSize; j < SENSOR.y + sensorSize; j++) {
        if (isOutsideImg(i, j, SENSOR)) continue;
        temperatureMapColor[i][j] = -1;
        ctx.fillRect(
          Math.floor(i * HORIZONTAL_GAP),
          Math.floor(j * VERTICAL_GAP),
          HORIZONTAL_GAP,
          VERTICAL_GAP
        );
      }
    }
  }
}

/**
 * Print sensor's personal range and color from their variables.
 * @param {Array} SENSORS Array of sensor objects.
 */
function printSensorsRadius(SENSORS) {
  for (const SENSOR of SENSORS) {
    ctx.fillStyle = "#FFC90E";
    let maxDistance = 0;
    for (let i = SENSOR.x - SENSOR.radius; i <= SENSOR.x + SENSOR.radius; i++) {
      for (
        let j = SENSOR.y - SENSOR.radius;
        j <= SENSOR.y + SENSOR.radius;
        j++
      ) {
        if (isOutsideImg(i, j, SENSOR)) continue;
        // Is it inside the circle area?
        const distance = Math.pow(i - SENSOR.x, 2) + Math.pow(j - SENSOR.y, 2);
        if (distance < Math.pow(SENSOR.radius, 2)) {
          if (maxDistance < distance) maxDistance = distance;
          let minColor = Math.floor(
            SENSOR.radius.map(MIN_RADIUS, MAX_RADIUS, 100, 0)
          );
          const temperatureColor = Math.floor(
            distance.map(
              0,
              Math.pow(SENSOR.radius, 2), // Max distance reachable is radius^2
              minColor,
              255
            )
          );
          // Has this cell already a temperature COOLER than the one I want to paint?
          // 0 is hotter and 255 cooler, because the red channel in the rgb calc is always 255
          // So the blue and green channel go from 0 (only red (hotter)) to 255 (whiter(cooler))
          if (temperatureColor < temperatureMapColor[i][j]) {
            temperatureMapColor[i][j] = temperatureColor;
            // Choosing color from temperature...
            ctx.fillStyle = rgbToHex(255, temperatureColor, temperatureColor);
            // And draw!
            ctx.fillRect(
              Math.floor(i * HORIZONTAL_GAP),
              Math.floor(j * VERTICAL_GAP),
              HORIZONTAL_GAP,
              VERTICAL_GAP
            );
          }
        }
      }
    }
  }
}
/**
 * Returns true if the position being checked is inside the img boundaries
 * or if is in the same spot of the sensor.
 * @param {Number} i Position in X axis
 * @param {Number} j Position in Y axis
 * @param {Object} SENSOR Object that contains all information from each sensor
 * @returns {Boolean}
 */
function isOutsideImg(i, j, SENSOR) {
  return (
    (i === SENSOR.x && j === SENSOR.y) ||
    i < 0 ||
    j < 0 ||
    i >= RESOLUTION ||
    j >= RESOLUTION
  );
}
/**
 * Returns the hexadecimal value from RGB number notation.
 * @param {Number} c Number referring to RGB channels. Must be from 0 to 255.
 * @returns {String}
 */
function componentToHex(channel) {
  if (channel > 255) channel = 255;
  if (channel < 0) channel = 0;
  let hex = channel.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
/**
 * Works together with componentToHex function to transform and RGB value to its
 * same in hexadecimal notation.
 * @param {Number} r Red channel.
 * @param {Number} g Green channel.
 * @param {Number} b Blue channel.
 * @returns {String}
 */
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
/**
 * Return the value from an a range mapped to a new one.
 * @param {Number} in_min Minimim value from original range.
 * @param {Number} in_max Maximum value from original range.
 * @param {Number} out_min Minimim value to new range.
 * @param {Number} out_max Maximum value to new range.
 * @returns {Number}
 */
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

/* RUN */
createTempMapTexture();
/* RUN */
