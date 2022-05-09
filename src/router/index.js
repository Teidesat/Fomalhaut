import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/communications",
    name: "communications",
    component: () => import("../views/CommunicationsView.vue"),
  },
  {
    path: "/location",
    name: "location",
    component: () => import("../views/LocationView.vue"),
  },
  {
    path: "/sensors",
    name: "sensors",
    component: () => import("../views/SensorsView.vue"),
  },
  {
    path: "/tracking",
    name: "tracking",
    component: () => import("../views/TrackingView.vue"),
  },
  {
    path: "/encoder",
    name: "encoder",
    component: () => import("../views/EncoderView.vue"),
  },
  {
    path: "/decoder",
    name: "decoder",
    component: () => import("../views/DecoderView.vue"),
  },
  {
    path: "/temperaturemap",
    name: "temperaturemap",
    component: () => import("../views/TemperatureMapView.vue"),
  },
  {
    path: "/configuration",
    name: "configuration",
    component: () => import("../views/ConfigurationView.vue"),
  },
  {
    path: "/logs",
    name: "logs",
    component: () => import("../views/LogsView.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/AboutView.vue"),
  },
];

const router = createRouter({
  history: process.env.IS_ELECTRON
    ? createWebHashHistory()
    : createWebHistory(),
  routes,
});

export default router;
