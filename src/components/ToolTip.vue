<template lang="pug">
.tooltip(v-if="hover" :style="{ transform, width: width + 'px' }")
  .rows
    .row
      span {{ hover.name }}
      Metric(:metric="countyStats" bucket="counties" :id="hover.fips")
    .row
      span {{ hover.state }}
      Metric(:metric="stateStats" bucket="state" :id="hover.state")
    .row
      span USA
      Metric(:metric="usaStats")
</template>

<script>
import fill from '@/mixins/fill'
import Metric from '@/components/Metric'
import BarChart from '@/components/BarChart'
import { mapState, mapGetters } from 'vuex'

export default {
  mixins: [fill],
  components: { Metric, BarChart },
  data: () => ({
    width: 250
  }),
  mounted () {
    this.setViewport()
  },
  computed: {
    ...mapState(['hover', 'mouse', 'index']),
    ...mapGetters(['stateStats', 'countyStats', 'usaStats']),
    transform () {
      const offset = 30
      let [x, y] = this.mouse
      const [width, height] = this.viewport
      x += offset
      y += offset
      if (x > width - this.width) {
       x -= x - (width - this.width)
      }
      if (y > height - 100) {
        y -= 150
      }
      return `translateX(${x}px) translateY(${y}px)`
    }
  }
}
</script>

<style lang="scss" scoped>
.tooltip {
  @include position(absolute, 0 null null 0);
  // height: 150px;
  z-index: 100;
  pointer-events: none;
  background: rgba($black, .2);
  backdrop-filter: blur(10px);
  color: $white;
  border-radius: 10px;
  display: flex;
  padding: 10px 20px;
}

.rows {
  @include flex(center, space-between, column);
  width: 100%;
  display: flex;
}

.row {
  @include flex(center, space-between, row);
  margin-bottom: 7px;
  border-bottom: 1px solid rgba($white, .1);
  width: 100%;
  padding-bottom: 7px;
  font-size: 12px;

  &:last-of-type {
    margin-bottom: 0;
    border-bottom: 0;
  }
}
</style>