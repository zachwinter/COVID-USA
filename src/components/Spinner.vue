<template>
  <div class="spinner" ref="container" :class="{ visible, center }">
    <div class="el" />
  </div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    center: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
$size: 40px;

.container {
  @include size(100%);
  @include flex;
}

.spinner {
  @include size($size);
  @include flex;
  // @include position(absolute, 0 0 null 0);
  margin: 0 auto;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms linear;

  &.visible {
    opacity: 1;
  }

  &.center {
    @include position(absolute, 50% 0 null 0);
    transform: translateY(-50%);
  }
}

.el,
.el:after {
  content: '';
  border-radius: 50%;
  @include size($size);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

$col: $white;

.el {
  display: block;
  font-size: 10px;
  text-indent: -9999em;
  border-top: 1.1em solid transparent;
  border-right: 1.1em solid $col;
  border-bottom: 1.1em solid $col;
  border-left: 1.1em solid $col;
  animation: spin 1s infinite linear;
}
</style>