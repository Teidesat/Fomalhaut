<template>
  <router-link :to="path">
    <div
      class="page-selector"
      :class="{ disabled: disabled, selected: isActive }"
      :title="title"
    >
      <i :class="symbol"></i>
      <div v-if="isActive" class="page-selector-line"></div>
    </div>
  </router-link>
</template>

<script>
import { useRoute } from "vue-router";
export default {
  props: {
    title: String,
    symbol: String,
    disabled: Boolean,
    path: String,
  },
  computed: {
    isActive() {
      return useRoute().path === this.path;
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
  margin-top: -10px;
  margin-left: 10px;
}
</style>
