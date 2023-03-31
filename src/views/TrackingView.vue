<template>
  <div>
    <img ref="img" alt="Webcam Stream" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      streamUrl: "http://localhost:5000/stream",
    };
  },
  async created() {
    try {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");

      setInterval(() => {
        fetch(this.streamUrl, { method: "POST" })
          .then((response) => response.blob())
          .then((blob) => {
            const img = new Image();
            img.onload = () => {
              this.canvas.width = img.width;
              this.canvas.height = img.height;
              this.ctx.drawImage(img, 0, 0);
              this.$refs.img.src = this.canvas.toDataURL("image/jpeg");
            };
            img.src = URL.createObjectURL(blob);
          })
          .catch((error) => console.error(error));
      }, 15);
    } catch (error) {
      console.error(error);
    }
  },
};
</script>
