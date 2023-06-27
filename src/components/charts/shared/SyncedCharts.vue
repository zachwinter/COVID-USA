<template>
  <section class="synced-charts">
    <slot />
  </section>
</template>

<script setup lang="ts">
import { ZoomTransform, zoomIdentity } from 'd3-zoom';
import { type Ref, ref, provide } from 'vue'

const components: Ref<any[]> = ref([]);
const transform: Ref<ZoomTransform> = ref(zoomIdentity);

provide('register', function (component: any) {
  if (!components.value.includes(component)) components.value.push(component);
});

provide('update:transform', function (value: ZoomTransform) {
  transform.value = value;
  components.value.forEach(m => m(value));
});

provide('transform', transform);
</script>

<style lang="scss" scoped>
.synced-charts {
  display: contents;
  position: relative;
  z-index: 1000;
}
</style>
