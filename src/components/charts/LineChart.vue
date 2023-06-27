<template>
  <D3 ref="wrapper" v-bind="$props">
    <slot></slot>
  </D3>
</template>

<script setup lang="ts" generic="P extends BarChartProps">
import { type BarChartProps, BaseBarChartProps } from '../../types/BarChart';
import D3 from '../d3/D3.vue';

const props = withDefaults(
  defineProps<BarChartProps>(),
  BaseBarChartProps as any
);

const wrapper = ref();
const ctx: Ref<CanvasRenderingContext2D | null> = ref(null);

watch(
  () => [props.width, props.height, props.dpr],
  async (size) => {
    if (!ctx.value) return;
    await nextTick();
    ctx.value?.resetTransform();
    ctx.value?.scale(size[2], size[2]);
    ctx.value.lineWidth = props.lineWidth;
    ctx.value.strokeStyle = props.barColor;
    tick();
  }
);

watch(
  () => wrapper.value?.transform,
  () => tick()
);

function tick() {
  const { width, height, dataset }: any = props;
  const xScale = wrapper.value.scales.x as any;
  const yScale = wrapper.value.scales.y as any;

  let initializing = false;
  let initialized = false;
  let finalized = false;

  const path = new Path2D();

  dataset.forEach?.((coords: [number, number], i:number) => {
    if (finalized) return;

    const x = xScale?.(coords[0]) || null;
    const y = yScale?.(coords[1]) || null;

    if (x <= 0) return;

    if (x >= width) {
      path.lineTo(x, y);
      finalized = true;
      return;
    } else if (!initialized) {
      const x = xScale?.(dataset[i - 1 < 0 ? 0 : i - 1][0]) || null;
      const y = yScale?.(dataset[i - 1 < 0 ? 0 : i - 1][1]) || null;
      path.moveTo(x, y);
      initializing = true;
    }

    if (initializing) {
      path.lineTo(x, y);
      initializing = false;
      initialized = true;
    } else {
      path.lineTo(x, y);
    }
  });

  if (!ctx.value) return;

  ctx.value?.clearRect(0, 0, width, height);
  ctx.value?.stroke(path);
}

onMounted(async () => {
  ctx.value = wrapper.value.canvas.getContext('2d') || null;
  ctx.value &&
    (ctx.value.scale(props.dpr, props.dpr),
    (ctx.value.strokeStyle = props.barColor));
  await nextTick();
  tick();
});
</script>
