<template>
  <svg ref="svg" :height="height" :width="padding">
    <g ref="g" :transform="`translate(${padding}, 0)`"></g>
  </svg>
</template>

<script setup lang="ts">
import { ScaleRecord } from '../../types/D3';
import { select } from 'd3-selection';
import { ZoomTransform } from 'd3-zoom';
import { axisLeft } from 'd3-axis';
import { type Ref, ref, inject, computed, watch, onMounted } from 'vue'

const scales = inject('scales') as Ref<ScaleRecord>;
const transform = inject('transform') as Ref<ZoomTransform>;
const padding = inject('padding') as Ref<number>;
const height = inject('height') as Ref<number>;
const svg: Ref<SVGElement | null> = ref(null);
const g: Ref<SVGGElement | null> = ref(null);
const initialized = ref(false);
const yScale = computed(() => axisLeft(scales.value.y));

function init() {
  select(g.value).call(yScale.value as any);
  initialized.value = true;
}

watch(
  () => [transform.value, scales.value.y],
  () => {
    select(g.value).call(yScale.value as any);
  },
  { deep: true }
);

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
svg {
  @include position(absolute, 0 null null 0);
}
</style>
