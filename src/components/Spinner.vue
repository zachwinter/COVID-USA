<template>
  <div :class="{ visible }">
    <span class="spinner" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<style lang="scss" scoped>
div {
  @include size(100vw, 100vh);
  @include flex;
  @include position(fixed, 0 null null 0);
  z-index: 100;
  pointer-events: none;
  background: #0f0611;
  opacity: 0;
  transition: opacity var(--duration) var(--easing);

  &.visible {
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: translateY(-50%) translateX(-50%) rotate(0deg);
  }
  100% {
    transform: translateY(-50%) translateX(-50%) rotate(360deg);
  }
}

.spinner {
  @include size(40px);
  @include center;
  display: block;
  border: 4px solid var(--gray);
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
