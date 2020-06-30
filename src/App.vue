<template lang="pug">
.app
  Loading
  BaseLayout(v-if="!loading")
    template(v-slot:aside)
      Controls
      Buckets
    template(v-slot:map)
      Datapoints(:transform="transform" :projection="projection")
      USA(@transform="onTransform" @projection="onProject" :mapData="topojson" @hover="onHover" @mouse="onMouse")
      ToolTip
      GitHub
</template>

<script>
import { mapState } from 'vuex'
import {
  SET_TRANSFORM, 
  SET_PROJECTION, 
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
import GitHub from '@/components/GitHub'
import Datapoints from '@/components/Datapoints'

export default {
  components: {
    Loading,
    BaseLayout,
    ToolTip, 
    Controls,
    Buckets,
    GitHub,
    USA,
    Datapoints
  },
  computed: mapState([
    'data',
    'loading', 
    'topojson', 
    'transform', 
    'projection',
    'hover'
  ]),
  watch: {
    data () {
      this.$store.dispatch('animate')
    }
  },
  created () {
    this.$store.dispatch('fetchData')
  },
  methods: {
    onTransform (val) {
      this.$store.commit(SET_TRANSFORM, val)
    },
    onProject (val) {
      this.$store.commit(SET_PROJECTION, val)
    },
    onHover (val) {
      this.$store.commit(SET_HOVER, val)
      if (!val) return
      this.$store.commit(SET_COUNTY, val.fips)
      this.$store.commit(SET_STATE, val.state)
    },
    onMouse (val) {
      this.$store.commit(SET_MOUSE, val)
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
