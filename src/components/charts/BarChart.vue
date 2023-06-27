<template>
  <D3 ref="wrapper" v-bind="$props">
    <slot></slot>
  </D3>
</template>

<script setup lang="ts" generic="P extends BarChartProps">
import { type BarChartProps, BaseBarChartProps } from '../../types';
import D3 from './shared/D3.vue'
import { type Ref, ref, watch , onMounted } from 'vue'

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
  const { width, height, lineWidth, data } = props;
  const xScale = wrapper.value.scales.x as any;
  const yScale = wrapper.value.scales.y as any;

  let started = true;
  let finished = false;

  ctx.value?.clearRect(0, 0, width, height);

  const path = new Path2D();

  (data as any[])?.forEach?.((values: any) => {
    if (finished) return;

    const x = xScale?.(values[0]) || null;

    if (x >= 0) {
      if (!started) started = true;
    } else {
      return;
    }

    if (x > width) {
      finished = true;
      return;
    }

    const y = yScale?.(values[1]);

    path?.rect(x - lineWidth / 2, y, lineWidth, height - y);
  });

  ctx.value?.fill(path);
}


onMounted(async () => {
  await nextTick();
  ctx.value = wrapper.value.canvas.getContext('2d') || null;
  ctx.value &&
    (ctx.value.scale(props.dpr, props.dpr),
    (ctx.value.fillStyle = props.barColor));
  tick();
});
</script>
