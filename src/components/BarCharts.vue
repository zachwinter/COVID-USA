<template>
  <div class="bar-charts" :class="{ visible }" ref="container">
    <SyncedCharts>
      <div
        v-for="datum in data.selectedCounties"
        :key="datum.fips"
        class="container"
      >
        <LineChart
          class="chart"
          :style="{ height: height + 'px' }"
          :height="height"
          :width="width"
          :domain-x="domain"
          :domain-y="[8, 0]"
          :dataset="buildDataset(datum)"
        />
        <h3 class="county">{{  datum.city }} Co., {{ datum.state }}</h3>
        <button @click="remove(datum.fips)"><CloseIcon /></button>
      </div>
    </SyncedCharts>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '../assets/close.svg';
import { Location } from '../store/data';
import { subDays } from 'date-fns';

const viewport = useViewport();
const data = useData();
const visible = computed(() => data.selectedCounties.length);
const containerWidth = ref(viewport.width);
const width = computed(
  () => containerWidth.value / data.selectedCounties.length
);
const height = computed(() => viewport.height / 3);
const container = ref();
const domain: ComputedRef<[Date, Date]> = computed(() => [
  subDays(data.dates[data.totalDays - 1], 180),
  data.dates[data.totalDays - 1],
]);

watch(
  () => viewport.width,
  () => {
    const box = container.value?.getBoundingClientRect();
    containerWidth.value = box.width;
  }
);

function buildDataset(datum: Location) {
  return data
    .getHistoricalCountyValuesByFips(datum.fips)
    .map((v, i) => [data.dates[i], (v[2] / datum.population) * 100]);
}

function remove(fips: string) {
  data.selectedCounties = data.selectedCounties.filter(
    datum => datum.fips !== fips
  );
}

onMounted(() => {
  const box = container.value?.getBoundingClientRect();
  containerWidth.value = box.width;
});
</script>

<style lang="scss" scoped>
.bar-charts {
  @include position(fixed, null 0 0 0);
  @include flex(flex-start, flex-start, row);
  overflow: hidden;
  transform: translateY(100%);
  z-index: 9;
  font-family: var(--font-family);
  background: linear-gradient(to top, #0f0611, transparent);
  transition: var(--base-transition);

  &.visible {
    transform: translateY(0);
  }

  * {
    color: var(--white);
  }
}

.container {
  position: relative;

  button {
    @include position(absolute, 0 var(--outer-padding) null null);
    @include size(px(30));
    @include strip;
    background: rgba(darken(map-get($colors, 'purple'), 10%), 0.97);
    padding: px(5);
    z-index: 200;

    svg {
      @include size(100%);

      :deep(*) {
        fill: var(--white);
      }
    }
  }
}
</style>

<style lang="scss">
.chart .domain {
  color: rgb(153, 102, 153);
}

.chart line {
  color: #996699;
}

.county {
  @include position(absolute, 0 calc(#{px(30)} + (var(--outer-padding) * 2)) null null);
  font-size: px(20);
  line-height: px(30);
}
</style>
