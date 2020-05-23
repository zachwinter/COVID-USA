<template lang="pug">
.loading(:class="{ visible: loading }")
  Spinner
</template>

<script>
import { mapState } from 'vuex'
import Spinner from '@/components/Spinner'

export default {
  components: { Spinner },
  computed: mapState(['loading'])
}
</script>

<style lang="scss" scoped>
.loading {
  @include position(fixed, 0 0 0 0);
  @include flex;
  z-index: 9999;
  background: $dark-purple;
  color: $white;
  opacity: 0;
  pointer-events: none;
  transition: opacity $base-transition;
  will-change: opacity;

  &.visible { opacity: 1; }
}
</style>