<template lang="pug">
.tooltip(v-if="hover" :style="{ transform, width: width + 'px' }")
  .rows
    .row
      span {{ hover.county.name }}
      Metric(:metric="countyStats")
    .row
      span {{ hover.state.name }}
      Metric(:metric="stateStats")
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
    width: 200
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
  z-index: 10;
  pointer-events: none;
  background: rgba($black, .2);
  backdrop-filter: blur(10px);
  color: $white;
  border-radius: 10px;
  display: flex;
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
  width: 170px;
  padding-bottom: 7px;
  font-size: 12px;

  // div {
  //   @include flex(center, space-between);
  //   width: 100%;
  // }

  &:first-of-type {
    padding-top: 7px;
  }

  &:last-of-type {
    margin-bottom: 0;
    border-bottom: 0;
  }
}

small {
  opacity: .5;
  padding-left: 5px;
}

.chart {
  @include size(160px, 30px);
  position: relative;
  // margin-left: 30px;
}

.val {
  @include flex(center, space-between);
  @include size(100%, auto);
}
</style>