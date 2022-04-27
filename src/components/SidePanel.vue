<template>
  <div class="left-panel">
    <FamilySelector
      v-for="familySelector in familySelectorsData"
      :key="familySelector"
      :name="familySelector.name"
      :symbol="familySelector.symbol"
      :pages="familySelector.pages"
    ></FamilySelector>
    <PageSelector
      v-for="selector in lonelyPageSelectorsData"
      :key="selector"
      :title="selector.title"
      :symbol="selector.symbol"
      :disabled="selector.disabled"
      :path="selector.path"
    ></PageSelector>
  </div>
</template>

<script>
import PageSelector from "@/components/PageSelector.vue";
import FamilySelector from "@/components/FamilySelector.vue";
import {
  familySelectors,
  lonelyPageSelectors,
} from "@/data/page-selectors.json";

export default {
  components: { PageSelector, FamilySelector },
  data() {
    return {
      familySelectorsData: familySelectors,
      lonelyPageSelectorsData: lonelyPageSelectors,
    };
  },
};
</script>

<style scoped>
.left-panel {
  float: left;
  height: calc(100%);
  width: 65px;
  background: #2c2c2c;
}
</style>
