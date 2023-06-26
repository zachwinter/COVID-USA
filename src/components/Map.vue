<template>
  <figure
    ref="container"
    class="container"
    @mouseout="hideToolTip"
    @click="selectCounty"
  >
    <canvas
      ref="map"
      class="map"
      :width="width"
      :height="height"
      :style="css"
    />

    <canvas
      ref="datums"
      class="datums"
      :width="width"
      :height="height"
      :style="css"
    />

    <canvas
      ref="cursor"
      class="cursor"
      :width="width"
      :height="height"
      :style="css"
    />

    <ToolTip
      :visible="tooltip.visible"
      :coords="tooltip.coords"
      :datum="tooltip.datum"
      :dataset-index="tooltip.datasetIndex"
      :deltas="tooltip.deltas"
      :state="tooltip.state"
    />
  </figure>
</template>

<script setup lang="ts">
import Map from '../classes/Map';
import { type Location } from '../store/data';

export interface ToolTipData {
  visible: boolean;
  coords: [number, number];
  datum: Location | null;
  datasetIndex: number;
  deltas: [number, number, number] | null;
  state: any;
}

const emit = defineEmits(['hover']);
const viewport = useViewport();
const data = useData();
const container = ref();
const map = ref();
const datums = ref();
const cursor = ref();
const app = ref();
const { width, height, css, setSize } = useArtboard();
const tooltip: Ref<ToolTipData> = ref({
  coords: [0, 0],
  datum: null,
  visible: false,
  datasetIndex: -1,
  countyPopulation: -1,
  deltas: null,
  state: null,
});

watch(
  () => data.day,
  () => {
    if (tooltip.value.datum) {
      tooltip.value.datum.values = data.getCountyValuesByFips(
        tooltip.value.datum.fips
      );

      tooltip.value.deltas = data.getCountyDeltasByFips(
        tooltip.value.datum.fips
      );

      tooltip.value.state = data.getStateDataByFips(
        tooltip.value.datum.stateFips
      );
    }

    app.value.paint();
  }
);

watch(
  () => data.datasetIndex,
  val => {
    app.value.state.datasetIndex = val;
    tooltip.value.datasetIndex = val;
    app.value.paint();
  }
);

watch(
  () => viewport.screen,
  () => onResize()
);

async function onResize() {
  const { width, height } = container.value.getBoundingClientRect();
  setSize(width, height);
  await nextTick();
  app.value?.resize?.();
}

function onMouseMove({ coords, datum }: ToolTipData): void {
  tooltip.value.coords = coords;
  tooltip.value.datum = datum as Location;
  tooltip.value.datasetIndex = data.datasetIndex;

  if (!datum) return;

  tooltip.value.datum.values = data.getCountyValuesByFips(datum.fips);
  tooltip.value.deltas = data.getCountyDeltasByFips(datum.fips);
  tooltip.value.state = data.getStateDataByFips(datum.stateFips);

  emit('hover', datum);

  showToolTip();
}

function showToolTip() {
  tooltip.value.visible = true;
}

function hideToolTip() {
  tooltip.value.visible = false;
}

function selectCounty() {
  const fips = tooltip.value?.datum?.fips;
  if (!fips) return;
  data.selectCountyByFips(fips);
}

onMounted(async () => {
  const { width, height } = container.value.getBoundingClientRect();
  setSize(width, height);

  await nextTick();

  const canvases = {
    map: map.value,
    datums: datums.value,
    cursor: cursor.value,
  };

  app.value = new Map({
    canvases,
    locations: data.locationData as Location[],
    datasetIndex: data.datasetIndex,
    getCountyValuesByFips: data.getCountyValuesByFips,
    fipsData: data.fipsData,
    onMouseMove,
    hideToolTip,
    perCapita: data.perCapita,
    usa: data.usa,
  });
});

onBeforeUnmount(() => {
  app.value.destroy();
});
</script>

<style lang="scss" scoped>
.container {
  @include size(100vw, 100vh);
}

canvas {
  @include position(absolute, 0 null null 0);
  display: block;

  &.map {
    z-index: 1;
  }
  &.datums {
    z-index: 2;
  }
  &.cursor {
    z-index: 3;
  }
}
</style>
