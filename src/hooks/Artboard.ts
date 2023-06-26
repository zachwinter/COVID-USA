export function useArtboard(
  initialWidth = 0,
  initialHeight = 0,
  initialDpr = window.devicePixelRatio
) {
  const size: Ref<[number, number, number]> = ref([
    initialWidth,
    initialHeight,
    initialDpr,
  ]);

  const width = computed(() => size.value[0] * size.value[2]);
  const height = computed(() => size.value[1] * size.value[2]);
  const dpr = computed(() => size.value[2]);
  const css = computed(() => ({
    width: size.value[0] + 'px',
    height: size.value[1] + 'px',
  }));

  return {
    width,
    height,
    dpr,
    css,
    setSize(width = 0, height = 0, dpr = window.devicePixelRatio) {
      size.value = [width, height, dpr];
    },
  };
}
