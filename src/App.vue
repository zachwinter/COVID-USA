<template lang="pug">
.app
  Loading
  BaseLayout(v-if="!loading")
    template(v-slot:aside)
      Controls
      Buckets
    template(v-slot:map)
      .map(ref="map")
        ToolTip
        GitHub
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  SET_STATE,
  SET_COUNTY,
  SET_MOUSE,
  SET_HOVER,
  SET_INDEX
} from '@/store'
import ToolTip from '@/components/ToolTip'
import Loading from '@/components/Loading'
import BaseLayout from '@/layouts/BaseLayout'
import Buckets from '@/components/Buckets'
import Controls from '@/components/Controls'
import Map from '@/classes/Map'
import GitHub from '@/components/GitHub'

export default {
  components: {
    Loading,
    BaseLayout,
    ToolTip, 
    Controls,
    Buckets,
    GitHub
  },
  computed: {
    ...mapState(['index', 'dataset', 'loading', 'data', 'topojson']),
    ...mapGetters(['caseIndex']),
  },
  watch: {
    dataset (val) {
      this.map.state.dataset = val
    },
    index (val) {
      this.map.state.index = val
    },
    caseIndex (val) {
      this.map.state.caseIndex = val
    },
    async loading (val) {
      if (!val) {
        await this.$nextTick()
        this.init()
      }
    }
  },
  created () {
    this.$store.dispatch('fetchData')
  },
  beforeDestroy () {
    this.map.destroy()
  },
  methods: {
    init () {
      this.map = new Map({
        container: this.$refs.map, 
        dataset: this.dataset, 
        caseIndex: this.caseIndex,
        data: this.data,
        usa: this.topojson
      })
      this.map.state.watch('hover', val => {
        this.$store.commit(SET_HOVER, val)
        if (val) {
          this.$store.commit(SET_STATE, val.state.name)
          this.$store.commit(SET_COUNTY, val.county)
        }
      })
      this.map.state.watch('mouse', val => {
        this.$store.commit(SET_MOUSE, val)
      })
      this.map.state.watch('index', val => {
        this.$store.commit(SET_INDEX, val)
      })
      window.addEventListener('resize', () => {
        this.$store.dispatch('detectMobile')
      })
      this.$store.dispatch('animate')
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
