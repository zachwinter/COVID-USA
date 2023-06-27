<template>
  <div class="selection-container" ref="container" :class="{ clickable }">
    <BaseCanvas
      name="selection"
      ref="canvas"
      @pointerdown="mouseDown"
      @pointermove="mouseMove"
      @pointerup="mouseUp"
    />
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, inject } from 'vue'
import { zoomIdentity } from 'd3-zoom';
import { ScaleRecord } from '../../types/D3';
import { pointer } from 'd3-selection';
import BaseCanvas from './BaseCanvas.vue';

const $emit = defineEmits(['select-start', 'select-end']);
const viewport = useViewport();
const canvas = ref();
const container: Ref<HTMLElement | null> = ref(null);
const scales = inject('scales') as Ref<ScaleRecord>;
const width = inject('width') as Ref<number>;
const height = inject('height') as Ref<number>;
const transform = inject('transform') as Ref<typeof zoomIdentity>;
const selecting: Ref<boolean> = ref(false);
const coords: Ref<[[number, number], [number, number]] | null> = ref([
  [0, 0],
  [0, 0],
]);
const range: ComputedRef<any> = computed(() => {
  if (coords.value === null) return null;
  return coords.value.map(([x]) =>
    transform.value.rescaleX(scales.value.x).invert(x)
  );
});
const ctx: Ref<CanvasRenderingContext2D | null> = ref(null);
const clickable = computed(() => !('ontouchstart' in window));

function createGradient(ctx: Ref<CanvasRenderingContext2D>) {
  const base = '153, 102, 153';
  const gradient = ctx.value.createLinearGradient(
    width.value / 2,
    0,
    width.value / 2,
    height.value
  );
  gradient.addColorStop(0, `rgba(${base}, 0)`);
  gradient.addColorStop(1, `rgba(${base}, .25)`);
  ctx.value.resetTransform();
  ctx.value.scale(viewport.dpr, viewport.dpr);
  ctx.value.fillStyle = gradient;
}

defineExpose({ $el: () => container.value });

watch(
  () => [range.value, coords.value],
  async () => {
    await nextTick();
    tick();
  },
  {
    deep: true,
  }
);

watch(
  () => [width.value, height.value],
  async () => {
    if (!ctx.value) return;
    await nextTick();
    createGradient(ctx as Ref<CanvasRenderingContext2D>);
  }
);

function mouseDown(e: MouseEvent) {
  $emit('select-start', range.value);
  const [x, y] = pointer(e);
  coords.value = [
    [x, y],
    [x, y],
  ];
  selecting.value = true;
}

function mouseMove(e: MouseEvent) {
  e.preventDefault();

  if (coords.value && selecting.value) {
    coords.value[1] = pointer(e) as any;
  }
}

function mouseUp(e: MouseEvent) {
  if (!coords.value) return e.preventDefault();
  selecting.value = false;
  coords.value[1] = pointer(e);
  ctx.value?.clearRect(0, 0, width.value, height.value);
  if (coords.value[1][0] - coords.value[0][0] > 3)
    $emit('select-end', range.value);
  coords.value = null;
  selecting.value = false;
}

function tick() {
  if (!ctx.value || coords.value === null) return;
  const [x1] = coords.value[0];
  const [x2] = coords.value[1];
  ctx.value.clearRect(0, 0, width.value, height.value);
  ctx.value.fillRect(x1, 0, x2 - x1, height.value);
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d');
  if (!ctx.value) return;
  createGradient(ctx as Ref<CanvasRenderingContext2D>);
});
</script>

<style lang="scss" scoped>
.selection-container {
  @include position(absolute, 0 0 null null);
  z-index: 100;
  width: v-bind(width);
  height: v-bind(height);
  background: linear-gradient(
    to top,
    rgba(59, 24, 63, 0.6),
    rgba(59, 24, 63, 0)
  );
  pointer-events: none;

  &.clickable {
    pointer-events: all;
  }
}
</style>
