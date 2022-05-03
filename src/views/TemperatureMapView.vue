<template>
  <nav>
    <router-link to="/temperaturemap">Gráfico de temperaturas</router-link> |
    <router-link to="/sensorsmap">Mapa de temperaturas</router-link>
  </nav>

  <div class="container">
    <div class="row">
      <div class="col">
        <Bar
          class="chart"
          :chart-options="chartOptions"
          :chart-data="chartData"
          :chart-id="chartId"
          :dataset-id-key="datasetIdKey"
          :plugins="plugins"
          :css-classes="cssClasses"
          :styles="styles"
          :width="width"
          :height="height"
        />
      </div>
    </div>
  </div>
  <!-- style="display: inline-block" -->
</template>

<script>
import { temperatureMap } from "../data/temperature-map.json";
import { Bar } from "vue-chartjs";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  name: "BarChart",
  components: { Bar },
  props: {
    chartId: {
      type: String,
      default: "bar-chart",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      temperatureMap: temperatureMap,
      chartData: {
        labels: this.getIdSensors(),
        datasets: [
          {
            label: "Temperatura de los sensores",
            backgroundColor: "#239160",
            data: this.getTemperatures(),
          },
        ],
      },
      chartOptions: {
        responsive: true,
      },
    };
  },
  methods: {
    getIdSensors() {
      return temperatureMap.map((sensor) => {
        return sensor.id_sensor;
      });
    },
    getTemperatures() {
      return temperatureMap.map((sensor) => {
        return sensor.temperature;
      });
    },
  },
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
