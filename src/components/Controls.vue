<template lang="pug">
form
  .flex
    .date {{ formattedActiveDate }}
    RangeInput(:min="0" :max="totalDays" :step="1" v-model="index")
    button(@click.prevent="$store.dispatch('animate')") Animate
  hr
  RadioGroup(v-model="dataset" name="Dataset" :options="[{ value: CASES, label: 'Cases' }, { value: DEATHS, label: 'Deaths' }]")
  hr
  RadioGroup(:disabled="dataset === DEATHS" v-model="map" name="Map" :options="[{ value: '2', label: 'Active (Derived)' }, { value: '0', label: 'Cumulative' }]")
  hr
  RadioGroup(v-model="datapoints" name="Datapoints" :options="[{ value: VALUES, label: 'Map Values' }, { value: POPULATION, label: 'Map Population %' }]")
</template>

<script>
import { mapGetters } from 'vuex'
import RadioGroup from './RadioGroup'
import RangeInput from './RangeInput'
import { SET_DATASET, SET_INDEX, CASES, DEATHS, SET_MAP, POPULATION, VALUES, SET_DATAPOINTS } from '@/store'

export default {
  components: { RadioGroup, RangeInput },
  data: () => ({ CASES, DEATHS, POPULATION, VALUES }),
  computed: {
    ...mapGetters(['totalDays', 'formattedActiveDate']),
    dataset: {
      get () {
        return this.$store.state.dataset
      },
      set (val) {
        if (val === DEATHS) this.$store.commit(SET_MAP, '0')
        this.$store.commit(SET_DATASET, val)
      }
    },
    index: {
      get () {
        return this.$store.state.index
      },
      set (val) {
        this.$store.commit(SET_INDEX, val)
      }
    },
    map: {
      get () {
        return this.$store.state.map
      },
      set (val) {
        this.$store.commit(SET_MAP, val)
      }
    },
    datapoints: {
      get () {
        return this.$store.state.datapoints
      },
      set (val) {
        this.$store.commit(SET_DATAPOINTS, val)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
form {
  padding: 10px;

  // @include max-width(mobile) {
  //   padding: 10px;
  // }

  // @include mobile-landscape {
  //   padding-top: 40px;
  // }
}

hr {
  @include size(100%, 1px);
  background: rgba(255, 255, 255, .2);
  border: 0;
  margin: 10px 0;
}

.flex {
  @include flex(center, space-between);
  margin-bottom: 5px;
}

.date {
  font-weight: 700;
  width: 80px;
}

button {
  @include clear;
  color: white;
  border: 1px solid white;
  font-weight: 300;
  padding: 3px;
  border-radius: 3px;
  margin-left: 10px;
  font-size: 10px;
}
</style>