<template>
  <main v-if="data.loaded">
    <DatePicker
      :range="data.dateRange"
      :date="data.date"
      @select="(value:Date) => data.setDateByDateObject(value)"
    />
    <Map @hover="onHover" />
    <BarCharts />
    <Share />
  </main>

  <Spinner :visible="!data.loaded" />
</template>

<script setup lang="ts">
import { Location } from './store/data';

const data = useData();
const datum = ref();

function onHover(location: Location) {
  datum.value = location;
}

watch(
  () => data.loaded,
  (val) => {
    if (val && !window.location.hash.length) return

    try {
      const hash = window.location.hash.slice(1);
      const day = hash.slice(2, 4);
      const month = hash.slice(0, 2);
      const year = hash.slice(-4);
      data.setDateByDateObject(new Date(`${month}/${day}/${year}`));
    } catch (e) {
      console.log(e);
    }

    console.log(data)
  }
);
</script>

<style lang="scss">
@import './main.scss';

html,
body {
}

main {
  @include flex(flex-start, flex-start);
  margin-right: notch(right);
}
</style>
