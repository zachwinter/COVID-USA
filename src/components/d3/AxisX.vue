<template>
  <svg ref="svg" :width="width + padding" :height="padding">
    <g ref="g" :transform="`translate(${padding}, 0)`"></g>
  </svg>
</template>

<script setup lang="ts">
import { ScaleRecord } from '../../types/D3';
import { select } from 'd3-selection';
import { ZoomTransform } from 'd3-zoom';
import { axisBottom } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { type Ref, ref, inject, computed, watch, onMounted } from 'vue'

const scales = inject('scales') as Ref<ScaleRecord>;
const transform = inject('transform') as Ref<ZoomTransform>;
const padding = inject('padding') as Ref<number>;
const width = inject('width') as Ref<number>;
const svg: Ref<SVGElement | null> = ref(null);
const g: Ref<SVGGElement | null> = ref(null);
const initialized = ref(false);
const ticks = computed(() =>
  scaleLinear(
    [320, 480, 600, 720, 1440, 1920],
    [4, 5, 6, 7, 8, 12]
  )(width.value)
);
const xScale = computed(() => axisBottom(scales.value.x).ticks(ticks.value));

function init() {
  select(g.value).call(xScale.value as any);
  initialized.value = true;
}

watch(
  () => [transform.value, scales.value.x, width.value],
  async () => {
    await nextTick();
    select(g.value).call(xScale.value as any);
  }
);

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
svg {
  @include position(absolute, 100% 0 null null);
  transform: translateY(-100%);
}
</style>
