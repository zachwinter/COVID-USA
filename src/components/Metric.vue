<template lang="pug">
div
  span {{ metric[0] | prettyNumber }}
  small {{ metric[1] | delta }}
</template>

<script>
export default {
  props: {
    metric: Array
  }
}
</script>

<style lang="scss" scoped>
div {
  @include flex(center, flex-end);
}
 
small {
  padding-left: 5px;
  opacity: .5;
}
</style>