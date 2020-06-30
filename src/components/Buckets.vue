<template lang="pug">
.buckets
  .bucket(v-if="activeCounty")
    h2
      span {{ activeCounty.county }}
      Metric(:metric="countyStats" bucket="counties" :id="activeCounty.fips")
    BarChart(:model="countyModel" :index="index")
  .bucket(v-if="state")
    h2
      span {{ state }}
      Metric(:metric="stateStats" bucket="state" :id="state")
    BarChart(:model="stateModel" :index="index")
  .bucket
    h2
      span USA
      Metric(:metric="usaStats" bucket="country")
    BarChart(:model="countryModel" :index="index")
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Metric from '@/components/Metric'
import BarChart from '@/components/BarChart'

export default {
  components: { Metric, BarChart },
  computed: {
    ...mapState([
      'state',
      'isMobile',
      'index',
      'data'
    ]),
    ...mapGetters([
      'stateModel',
      'stateStats',
      'countyModel',
      'countyStats',
      'usaStats',
      'countryModel',
      'activeCounty'
    ])
  }
}
</script>

<style lang="scss" scoped>
.buckets {
  height: calc(100% - 162px);
  overflow-y: auto;
  padding: 20px;

  @include max-width(mobile) {
    padding: 10px;
  }
}

.bucket {
  margin-bottom: 50px;
  &:last-of-type { margin-bottom: 0; }
}

h2 {
  @include flex(center, space-between);
  font-size: 12px;
  font-weight: 300;
  text-align: center;
  margin-bottom: $base-margin / 2;

  span:first-of-type { font-weight: 700; }

  small {
    padding-left: 5px;
    opacity: .5;
  }
}
</style>