<template>
  <div class="container-fluid p-0">
    <div class="row bg-dark justify-content-start no-gutters sticky-top">
      <TopPanel></TopPanel>
    </div>
    <div class="row content">
      <div class="col-1 pe-0 bg-dark">
        <SidePanel></SidePanel>
      </div>
      <div class="col-11 p-0">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import TopPanel from "./components/TopPanel.vue";
import SidePanel from "./components/SidePanel.vue";

export default {
  components: {
    TopPanel,
    SidePanel,
  },
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
  overflow-x: hidden;
}
.content {
  height: 100%;
}
@media (min-height: 20vh) {
  .content {
    height: 100vh;
  }
}

@import "bootstrap";
</style>
