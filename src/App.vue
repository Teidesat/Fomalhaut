<template>
  <!-- <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> -->
  <TopPanel></TopPanel>
  <SidePanel></SidePanel>
  <router-view />
</template>

<script>
import TopPanel from "./components/TopPanel.vue";
import SidePanel from "./components/SidePanel.vue";

export default {
  components: { TopPanel, SidePanel },
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: white;
  font-family: "RobotoRegular", sans-serif;
  overflow: hidden;
}
</style>
