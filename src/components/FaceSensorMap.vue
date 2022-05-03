<template>
  <div class="my-canvas-wrapper">
    <canvas id="canvas" :style="sizeStyle" @mousedown="mouseMove"></canvas>
    <slot></slot>
  </div>
</template>

<script>
export default {
  // inject: ["provider"],
  props: {
    nCols: Number,
    width: String,
    height: String,
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      horizontalGap: null,
      verticalGap: null,
      SENSORS_POS: [],
      sizeStyle: {
        width: this.width,
        height: this.height,
      },
    };
  },

  methods: {
    setupCanvas() {
      this.canvas = document.getElementById("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.canvas.height = window.innerHeight;
      this.canvas.width = window.innerWidth;

      this.ctx.fillStyle = "#eee";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    getRandomSensors(nSensors) {
      const max_temp = 90;
      const min_temp = 25;
      for (let i = 0; i < nSensors; i++) {
        this.SENSORS_POS.push({
          x: Math.floor(Math.random() * this.nCols),
          y: Math.floor(Math.random() * this.nCols),
          temperature:
            Math.floor(Math.random() * (max_temp - min_temp + 1)) + min_temp,
        });
      }
    },
    printSensorsPos() {
      this.getRandomSensors(5);
      this.ctx.fillStyle = "black";
      for (const POS of this.SENSORS_POS) {
        this.ctx.fillRect(
          Math.floor(POS.x * this.horizontalGap),
          Math.floor(POS.y * this.verticalGap),
          this.horizontalGap,
          this.verticalGap
        );
      }
    },
    printTemperatureRadius() {
      // for (const POS of this.SENSORS_POS) {
      // }
    },
  },

  // eslint-disable-next-line vue/require-render-return
  // render() {},
  mounted() {
    this.setupCanvas();
    this.ctx.strokeStyle = "#cdcdcd";
    this.ctx.lineCap = "round";
    this.horizontalGap = this.ctx.canvas.width / this.nCols;
    this.verticalGap = this.ctx.canvas.height / this.nCols;
    /*
    for (let i = 0; i <= this.nCols; i++) {
      this.ctx.moveTo(this.horizontalGap * i, 0);
      this.ctx.lineTo(this.horizontalGap * i, this.ctx.canvas.height);
      this.ctx.stroke();
      this.ctx.moveTo(0, this.verticalGap * i);
      this.ctx.lineTo(this.ctx.canvas.width, this.verticalGap * i);
      this.ctx.stroke();
    }
    */
    this.printSensorsPos();
    this.printTemperatureRadius();
  },
};
</script>

<style>
#canvas {
  border: 3px solid rgb(116, 116, 116);
}
</style>
