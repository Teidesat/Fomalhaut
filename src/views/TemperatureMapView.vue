<template>
  <!-- <div class="container">
    <div class="row">
      <div class="col"> -->
  ¡¡¡¡¡Raycast!!!!!
  <TemperatureCube></TemperatureCube>
  <!-- </div>
    </div>
  </div> -->
</template>

<script>
import TemperatureCube from "@/components/TemperatureCube.vue";

export default {
  components: {
    TemperatureCube,
  },

  data() {
    return {
      canvas: null,
      ctx: null,
    };
  },
  mounted() {},
};
</script>

<style>
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #239160;
}
</style>
