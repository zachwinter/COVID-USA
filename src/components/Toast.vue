<template>
  <header :class="{ visible: t.visible && t.text?.length, [t.type]: t.type }">
    <p class="message">{{ t.text }}</p>
  </header>
</template>

<script setup lang="ts">
const t = useToast();
</script>

<style lang="scss" scoped>
header {
  @include position(fixed, 0 null null 50%);
  @include shadow;
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
  z-index: 10000;
  transition: var(--base-transition);
  will-change: transform, opacity;
  background: rgba(darken(map-get($colors, 'purple'), 10%), 0.97);
  color: var(--white);

  &.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0%);
  }

  .message {
    @include type(18, 40, 400);
    padding: 0 var(--outer-padding);
    height: px(40);
    line-height: px(40);
    white-space: nowrap;
  }
}
</style>
