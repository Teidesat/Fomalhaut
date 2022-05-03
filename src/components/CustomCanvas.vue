/* eslint-disable vue/multi-word-component-names */
<template>
  <div class="my-canvas-wrapper">
    <canvas id="canvas" :style="sizeStyle" @mousedown="mouseMove"></canvas>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    width: String,
    height: String,
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      provider: {
        canvas: null,
        context: null,
      },
      sizeStyle: {
        width: this.width,
        height: this.height,
      },
    };
  },
  provide() {
    return {
      provider: this.provider,
    };
  },
  /*
  methods: {

    getMousePos(canvas, evt) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (evt.clientX - rect.left) * (canvas.width / rect.width),
        y: (evt.clientY - rect.top) * (canvas.width / rect.width),
      };
    },

    log(e) {
      const mouse = this.getMousePos(this.canvas, e);
      console.log(
        Math.floor(mouse.x / this.horizontalGap),
        Math.floor(mouse.y / this.verticalGap)
      );
      this.ctx.fillRect(
        Math.floor(mouse.x / this.horizontalGap) * this.horizontalGap,
        Math.floor(mouse.y / this.verticalGap) * this.verticalGap,
        this.horizontalGap,
        this.verticalGap
      );
    },

    // drawLines() {
    //   this.ctx.moveTo(0, 0);
    //   this.ctx.lineWidth = 1;
    //   this.ctx.lineCap = "round";
    //   for (let i = 0; i <= this.nCols; i++) {
    //     this.ctx.moveTo(this.horizontalGap * i, 0);
    //     this.ctx.lineTo(this.horizontalGap * i, this.canvas.height);
    //     this.ctx.stroke();
    //     this.ctx.moveTo(0, this.verticalGap * i);
    //     this.ctx.lineTo(this.canvas.width, this.verticalGap * i);
    //     this.ctx.stroke();
    //   }
    // },
  },
  */
  mounted() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.provider.context = this.ctx;
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;

    this.ctx.fillStyle = "#eee";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
</script>
<style scoped>
#canvas {
  border: 3px solid rgb(116, 116, 116);
}
</style>
