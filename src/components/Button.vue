<template>
  <button v-bind="$attrs" :disabled="disabled" :class="{ transparent, square }"
    ><slot></slot
  ></button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean;
    transparent?: boolean;
    square?: boolean;
  }>(),
  {
    disabled: false,
    transparent: false,
    square: false,
  }
);
</script>

<style lang="scss" scoped>
button {
  @include strip;
  @include size(var(--button-width), var(--button-height));
  background: rgba(darken(map-get($colors, 'purple'), 10%), 0.7);
  font-size: px(16);
  line-height: var(--button-height);
  font-weight: 700;
  color: var(--white);
  transition: transform var(--hover-duration) var(--easing);

  &.active:not(:disabled) {
    color: var(--yellow);
    background: var(--white);
  }

  &:active:not(:disabled) {
    transform: scale(0.9);
  }

  &:disabled {
    font-weight: 300;
  }

  &.transparent {
    background: transparent;
  }
}
</style>
