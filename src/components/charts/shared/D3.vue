<template>
  <figure ref="container" :style="styles">
    <slot></slot>
    <AxisX />
    <AxisY />
    <Selection
      ref="cursor"
      @select-start="initTween"
      @select-end="selectRange"
    />
    <BaseCanvas name="canvas" ref="canvas" />
  </figure>
</template>

<script setup lang="ts">
import { ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom';
import { type ScaleRecord, type BaseProps, BarChartProps } from '../../../types';
import { buildScales } from '../../../util/scales';
import { initZoom } from '../../../util/zoom';
import { select } from 'd3-selection';
import { interpolateNumber } from 'd3-interpolate';
import { timer } from '../../../util/time';
import { DefaultProps } from '../../../types';

const register = inject('register') as any;
const updateTransform = inject('update:transform') as any;

register(setTransform);

const props = withDefaults(
  defineProps<BaseProps | BarChartProps>(),
  DefaultProps as any
);

const canvas = ref();
const cursor = ref();
const container: Ref<HTMLElement | null> = ref(null);
const zoomInstance: Ref<ZoomBehavior<Element, unknown> | null> = ref(null);
const zoomRef: Ref<any> = ref();
const transform: Ref<ZoomTransform> = ref(zoomIdentity);
const padding: ComputedRef<number> = computed(() => props.padding);
const tweening: Ref<boolean> = ref(false);
const paddedWidth: ComputedRef<number> = computed(
  () => props.width - props.padding
);
const paddedHeight: ComputedRef<number> = computed(
  () => props.height - props.padding
);
const scales: Ref<ScaleRecord> = ref(buildScales(props as any));

const referenceScales: Ref<ScaleRecord> = ref(
  Object.freeze({
    x: scales.value.x?.copy(),
    y: scales.value.y?.copy(),
  })
);

const styles = computed(() => ({
  'padding-left': padding.value + 'px',
  'padding-bottom': padding.value + 'px',
}));

watch(
  () => [props.width, props.height],
  async () => {
    scales.value = buildScales(props as any);
    referenceScales.value = Object.freeze({
      x: scales.value.x?.copy(),
      y: scales.value.y?.copy(),
    });
    applyZoom();
  }
);

let loop = false;

watch(
  () => transform.value,
  (val, old = zoomIdentity) => {
    if (val?.x === old?.x && val?.y === old?.y && val?.k === old?.k) return;

    if (props.zoomX) scales.value.x = val.rescaleX(referenceScales.value.x);
    if (props.zoomY) scales.value.y = val.rescaleY(referenceScales.value.y);

    const { x, y, k } = val;
    const $el = select(canvas?.value?.$el());
    zoomInstance.value?.translateTo($el, x, y);
    zoomInstance.value?.scaleTo($el, k);

    if (loop === true) {
      loop = false;
      return;
    }

    updateTransform(val);
  }
);

function setTransform(value: ZoomTransform) {
  loop = true;
  transform.value = value;
}

function _setTransform(value: ZoomTransform) {
  loop = false;
  transform.value = value;
}

function initTween() {
  tweening.value = true;
}

function buildTransformInterpolator(raw: [Date, Date]) {
  const range = raw
    .map((date: Date) => date.valueOf())
    .sort((a, b) => (a > b ? 1 : -1))
    .map(d => new Date(d));

  const delta = scales.value.x(range[1]) - scales.value.x(range[0]);
  const scale = paddedWidth.value / delta;
  const translate = -scales.value.x(range[0]);
  const t = zoomIdentity.scale(scale).translate(translate, 0);

  const iX = interpolateNumber(transform.value.x, t.x);
  const iY = interpolateNumber(transform.value.y, t.y);
  const iK = interpolateNumber(transform.value.k, t.k);

  return (progress: number) =>
    zoomIdentity.translate(iX(progress), iY(progress)).scale(iK(progress));
}

let _stop: Function | null = null;

async function selectRange(raw: [Date, Date]) {
  const $element = select(cursor.value.$el());
  const zoom = zoomInstance.value?.transform as any;
  const iZoom = buildTransformInterpolator(raw);

  if (_stop !== null) _stop();

  await timer(500, ({ progress, stop }: any) => {
    _stop = stop;
    const transform = iZoom(progress);
    $element.call(zoom, transform);
    _setTransform(transform);
  });

  tweening.value = false;
}

function applyZoom() {
  zoomRef.value?.();

  zoomRef.value = initZoom({
    setTransform: _setTransform,
    zoomInstance,
    element: container.value as any,
    scales,
    tweening,
  });
}

provide('props', toRefs(props));
provide('scales', scales);
provide('transform', transform);
provide('width', paddedWidth);
provide('height', paddedHeight);
provide('padding', padding);

defineExpose({
  scales,
  canvas,
  transform,
  setTransform,
});

onMounted(async () => {
  if (!props.zoomX && !props.zoomY) return;
  await nextTick();
  applyZoom();
});
</script>

<style lang="scss" scoped>
figure {
  position: relative;
}

.selection {
  @include position(absolute, 0 0 null null);
  z-index: -1;
  background: rgba(255, 255, 255, 0.5);
}
</style>
