<template lang="pug">
.app
  Loading
  BaseLayout(v-if="!loading")
    template(v-slot:aside)
      Controls
      Buckets
    template(v-slot:map)
      .map(ref="map")
      DaySlider
      //- Datapoints(:transform="transform" :projection="projection")
      //- USA(@transform="onTransform" @projection="onProject" :mapData="topojson" @hover="onHover" @mouse="onMouse")
      ToolTip
      //- GitHub
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  // SET_TRANSFORM, 
  // SET_PROJECTION, 
  SET_HOVER, 
  SET_MOUSE,
  SET_COUNTY,
  SET_STATE
} from '@/store'
import ToolTip from '@/components/ToolTip'
import Loading from '@/components/Loading'
import BaseLayout from '@/layouts/BaseLayout'
import Buckets from '@/components/Buckets'
import Controls from '@/components/Controls'
import USA from '@/components/USA'
// import GitHub from '@/components/GitHub'
import Datapoints from '@/components/Datapoints'
import Map from '@/classes/Map'
import DaySlider from '@/components/DaySlider'

export default {
  components: {
    Loading,
    BaseLayout,
    ToolTip, 
    Controls,
    Buckets,
    // GitHub,
    USA,
    Datapoints,
    DaySlider
  },
  computed: {
    ...mapState({
      data: s => s.data,
      dataset: s => s.dataset,
      _datapoints: s => s.datapoints,
      map: s => s.map,
      loading: s => s.loading, 
      topojson: s => s.topojson, 
      transform: s => s.transform, 
      projection: s => s.projection,
      hover: s => s.hover,
      index: s => s.index
    }),
    ...mapGetters(['datapoints'])
  },
  watch: {
    data (val) {
      this.$store.dispatch('animate')
      console.log(val)
    },
    _datapoints (val) {
      if (!this._map) return
      this._map.state.datapoints = val
    },
    datapoints (val) {
      if (!this._map) return 
      this._map.state.activeDataset = val
    }
  },
  async mounted () {
    await this.$store.dispatch('fetchData')
    this.init()
  },
  methods: {
    init () {
      this._map = new Map({
        container: this.$refs.map,
        datapoints: this._datapoints,
        activeDataset: this.datapoints,
        usa: this.topojson,
        data: this.data
      })

      this._map.state.watch('hover', val => {
        if (val === null) {
          this.$store.commit(SET_HOVER, null)
          return
        }
        this.$store.commit(SET_HOVER, val.datum)
        this.$store.commit(SET_COUNTY, val.datum.fips)
        this.$store.commit(SET_STATE, val.datum.state)
      })

      this._map.state.watch('mouse', val => {
        this.$store.commit(SET_MOUSE, val)
      })
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;700&display=swap');

*, *:before, *:after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}

body {
  font-family: 'Open Sans', sans-serif;
  font-weight: 300;
}

.map { @include size(100%); }
</style>
