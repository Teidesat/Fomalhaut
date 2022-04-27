import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CommunicationsView from "../views/CommunicationsView";
import LocationView from "../views/LocationView";
import SensorsView from "../views/SensorsView";
import TrackingView from "../views/TrackingView";
import EncoderView from "../views/EncoderView";
import DecoderView from "../views/DecoderView";
import ConfigurationView from "../views/ConfigurationView";
import LogsView from "../views/LogsView";
import AboutView from "../views/AboutView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  {
    path: "/communications",
    name: "communications",
    component: CommunicationsView,
  },
  { path: "/location", name: "location", component: LocationView },
  { path: "/sensors", name: "sensors", component: SensorsView },
  { path: "/tracking", name: "tracking", component: TrackingView },
  { path: "/encoder", name: "encoder", component: EncoderView },
  { path: "/decoder", name: "decoder", component: DecoderView },
  {
    path: "/configuration",
    name: "configuration",
    component: ConfigurationView,
  },
  { path: "/logs", name: "logs", component: LogsView },
  { path: "/about", name: "about", component: AboutView },
];

const router = createRouter({
  history: process.env.IS_ELECTRON
    ? createWebHashHistory()
    : createWebHistory(),
  routes,
});

export default router;
