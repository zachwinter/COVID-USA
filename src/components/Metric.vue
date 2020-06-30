<template lang="pug">
div
  span {{ metric[map] | prettyNumber }} {{ metric[map] | pop({ id, bucket }) }}
  small {{ metric[parseInt(map, 10) + 1] | delta }}
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['metric', 'id', 'bucket'],
  computed: mapState(['map'])
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