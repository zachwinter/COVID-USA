<template>
  <Toggle
    :modelValue="data.dataset"
    :options="toggleOptions"
    @update:modelValue="(val:Dataset) => data.dataset = val"
  />
</template>

<script setup lang="ts">
import { type Dataset } from '../store/data';

const data = useData();

const toggleOptions = computed(() => {
  return [
    {
      text: 'Active Cases',
      value: 'ACTIVE_CASES',
    },
    {
      text: 'Deaths',
      value: 'DEATHS',
    },
  ];
});
</script>

<style lang="scss" scoped>
.toggle {
  @include position(absolute, 0 0 null null);
  @include size(auto, var(--button-height));
  gap: var(--base-spacer);
  padding: 0 var(--outer-padding);
  background: rgba(darken(map-get($colors, 'purple'), 10%), 0.97);
  z-index: 10;
  color: var(--white);
  font-weight: 700;
  text-transform: uppercase;
  font-size: px(18);
}
</style>
