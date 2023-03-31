<template>
  <div>
    <img
      :src="imageUrl"
      alt="Webcam Stream"
      width="640"
      height="480"
      :key="imageUrl"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: "",
    };
  },
  async created() {
    try {
      const streamUrl = "http://localhost:5000/stream";

      setInterval(() => {
        fetch(streamUrl, { method: "POST" })
          .then((response) => response.blob())
          .then((blob) => {
            this.imageUrl = URL.createObjectURL(blob);
          })
          .catch((error) => console.error(error));
      }, 50);
    } catch (error) {
      console.error(error);
    }
  },
};
</script>
