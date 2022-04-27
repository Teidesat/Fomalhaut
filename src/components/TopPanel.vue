<template>
  <div class="top-panel">
    <router-link to="/">
      <div class="corner-icon">
        <img src="@/assets/images/fomalhaut_logo.png" alt="" />
      </div>
    </router-link>
    <div class="top-panel-bar">
      <div class="connection-status">
        <span><i class="fas fa-satellite-dish"></i></span
        ><span>Ground Station</span><span class="status-text-good">Online</span>
      </div>
      <div class="connection-status">
        <span><i class="fas fa-satellite"></i></span
        ><span>Next Satellite Window</span
        ><span class="status-text-info">{{ getMoment() }}</span>
      </div>
    </div>
    <!-- <div class="corner-options">
      <div class="window-option"><img src="assets/window-close.png" /></div>
      <div class="window-option"><img src="assets/window-max.png" /></div>
      <div class="window-option"><img src="assets/window-min.png" /></div>
    </div> -->
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
  overflow: hidden;
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

.top-panel {
  width: 100%;
  height: 65px;
  background: #2c2c2c;
}
.top-panel .corner-icon {
  float: left;
  width: 65px;
  height: 65px;
  background: #212121;
}
.top-panel .corner-icon img {
  width: calc(100% - 11px * 2);
  height: calc(100% - 11px * 2);
  margin: 11px;
  transition: transform 0.4s ease-out;
}
.top-panel .corner-icon img:hover {
  transform: rotate(180deg);
}
.top-panel .top-panel-bar {
  height: 100%;
  float: left;
  color: white;
}
.top-panel .top-panel-bar .connection-status {
  float: left;
  font-size: 10.5pt;
  margin-left: 17px;
  margin-top: 10px;
  margin-right: 22px;
  line-height: 20px;
  vertical-align: middle;
}
.top-panel .top-panel-bar .connection-status span {
  margin-left: 5px;
}
.top-panel .top-panel-bar .connection-status span:nth-child(3) {
  font-family: "RobotoCondensedRegular", sans-serif;
}
.top-panel .corner-options {
  float: right;
  color: white;
  margin-top: 8px;
}
.top-panel .corner-options .window-option {
  margin-right: 5px;
  width: 20px;
  height: 20px;
  float: right;
  cursor: pointer;
}
.top-panel .corner-options .window-option img {
  margin: 6px;
}
</style>
