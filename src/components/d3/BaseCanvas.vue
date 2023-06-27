<template>
  <canvas
    ref="canvas"
    :class="name"
    :width="artboard.width.value"
    :height="artboard.height.value"
    :style="artboard.css.value"
  />
</template>

<script setup lang="ts">
import { type Ref, ref, inject, watch } from 'vue'
import { useArtboard } from '../../hooks/Artboard';

defineProps<{ name: string | undefined }>();

const paddedWidth = inject('width') as Ref<number>;
const paddedHeight = inject('height') as Ref<number>;

const canvas: Ref<HTMLCanvasElement | null> = ref(null);
const artboard = useArtboard(
  paddedWidth.value,
  paddedHeight.value
);

defineExpose({
  getContext: function (
    type: '2d' | 'webgl' | 'webgl2'
  ): RenderingContext | null {
    const ctx = canvas.value?.getContext(type) || null;
    if (ctx instanceof CanvasRenderingContext2D)
      ctx.imageSmoothingEnabled = false;
    return ctx;
  },
  $el: () => canvas.value || null,
});

watch(
  () => [paddedWidth.value, paddedHeight.value],
  ([width, height]) => artboard.setSize(width, height)
);
</script>

<style lang="scss" scoped>
canvas {
  display: block;
}
</style>
