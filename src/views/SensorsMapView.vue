<template>
  <nav>
    <router-link to="/temperaturemap">Gráfico de temperaturas</router-link> |
    <router-link to="/sensorsmap">Mapa de temperaturas</router-link>
  </nav>
  <div class="container">
    <div class="row">
      <div class="col">
        <face-sensor-map
          :width="'400px'"
          :height="'400px'"
          :nCols="100"
        ></face-sensor-map>
      </div>
    </div>
  </div>
</template>

<script>
// import CustomCanvas from "@/components/CustomCanvas.vue";
import FaceSensorMap from "@/components/FaceSensorMap.vue";

export default {
  components: {
    // CustomCanvas,
    FaceSensorMap,
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
