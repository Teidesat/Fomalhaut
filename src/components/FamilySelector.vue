<template>
  <div
    class="page-selector btn-group dropend"
    :class="{ selected: isActive }"
    :title="name"
  >
    <!-- class="dropdown-toggle" -->
    <div
      data-bs-toggle="dropdown"
      aria-expanded="false"
      style="width: 100%; vertical-alignment: middle"
    >
      <i :class="symbol"></i>
      <div v-if="isActive" class="page-selector-line"></div>
    </div>
    <!-- <button type="button"> -->
    <ul class="dropdown-menu dropdown-menu-dark">
      <li v-for="page in pages" :key="page">
        <router-link class="dropdown-item" :to="page.path">
          <i :class="page.symbol" style="margin-right: 15px"></i>
          {{ page.title }}
        </router-link>
      </li>
      <!-- <li><a class="dropdown-item" href="#">Action</a></li>
      <li><a class="dropdown-item" href="#">Another action</a></li>
      <li><a class="dropdown-item" href="#">Something else here</a></li> -->
    </ul>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import PageSelector from "./PageSelector.vue";

export default {
  components: PageSelector,
  props: {
    name: String,
    symbol: String,
    pages: Array,
  },
  computed: {
    isActive() {
      for (let selector of this.pages)
        if (selector.path === useRoute().path) return true;
      return false;
    },
  },
};
</script>

<style>
.page-selector {
  width: 100%;
  height: 65px;
  text-align: center;
  cursor: pointer;
  transition: 0.25s ease;
}
.page-selector:hover {
  background: #605c5c;
}
.page-selector i {
  color: white;
  font-size: 21px;
  line-height: 65px;
  vertical-align: middle;
}
.page-selector.disabled {
  color: #5e5e5e;
  cursor: not-allowed;
  /* pointer-events: none; */
}
.page-selector.disabled i {
  pointer-events: none;
  color: #5e5e5e;
}
.page-selector.selected {
  background: #212121;
  box-shadow: inset 5px 5px 10px rgba(0, 0, 0, 0.2),
    inset -5px -5px 10px rgba(0, 0, 0, 0.2);
}
.page-selector .page-selector-line {
  opacity: 0;
}
.page-selector.selected .page-selector-line {
  opacity: 100%;
  width: 45px;
  height: 3px;
  background: #a3f4ff;
  border-radius: 65px;
  /* margin-top: -10px; */
  /* margin-left: -7px; */
}
.dropdown-menu-dark {
  background-color: #2c2c2c;
}
@import "bootstrap";
</style>
