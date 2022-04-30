<template>
  <div class="col-1 pe-0">
    <router-link to="/">
      <!-- <div class="corner-icon"> -->
      <img
        class="corner-icon img-fluid p-2"
        src="@/assets/images/fomalhaut_logo.png"
        alt=""
      />
      <!-- </div> -->
    </router-link>
  </div>
  <div class="col-6 connection-status">
    <span><i class="fas fa-satellite-dish"></i></span>
    <span>Ground Station</span><span class="status-text-good">Online</span>
    <span class="ms-3"><i class="fas fa-satellite"></i></span>
    <span>Next Satellite Window</span>
    <span class="status-text-info">{{ getMoment() }}</span>
  </div>
</template>

<script>
import moment from "moment";
export default {
  methods: {
    getMoment() {
      return moment().format("z H:mm:ss, D MMM YYYY,");
    },
  },
};
</script>

<style>
html,
body {
  height: 100%;
  width: 100%;
  background-color: white;
  font-family: "RobotoRegular", sans-serif;
}

* {
  margin: 0;
  padding: 0;
}

.status-text-good {
  color: #c7ffc2;
}

.status-text-info {
  color: #a3f4ff;
}

.corner-icon {
  width: 65px;
  height: 65px;
  /* background: #212121; */
  /* max-height: 65px; */
  max-width: 65px;
  /* min-height: 65px; */
  /* min-width: 65px; */
  transition: transform 0.4s ease-out;
}
.corner-icon:hover {
  transform: rotate(180deg);
}
/*
.corner-icon img {
   width: calc(100% - 11px * 2);
  height: calc(100% - 11px * 2);
  margin: 11px;
}
*/
/*
.top-panel .top-panel-bar {
  height: 100%;
  float: left;
  color: white;
}
*/
.connection-status {
  color: white;
  padding-top: 10px;
  font-size: 10.5pt;
  line-height: 20px;
  vertical-align: middle;
}
.connection-status span {
  margin-left: 5px;
}
.connection-status span:nth-child(3) {
  font-family: "RobotoCondensedRegular", sans-serif;
}

@import "bootstrap";
</style>
