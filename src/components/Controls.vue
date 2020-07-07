<template lang="pug">
.controls
  .title 
    h1 #[span COVID #[strong USA]] #[.date {{ formattedActiveDate }}]
    hr
    p Active cases have been calculated based on an average recovery time of 21 days
  form
    RadioGroup(:options="datasets" v-model="dataset" name="dataset")
    //- RadioGroup(v-model="dataset" name="Dataset" :options="[{ value: CASES, label: 'Cases' }, { value: DEATHS, label: 'Deaths' }]")
    //- hr
    //- RadioGroup(:disabled="dataset === DEATHS" v-model="map" name="Map" :options="[{ value: '2', label: 'Active (Calculated)' }, { value: '0', label: 'Cumulative' }]")
    hr
    RadioGroup(v-model="datapoints" name="Datapoints" :options="[{ value: VALUES, label: 'Map Values' }, { value: POPULATION, label: 'Map Population %' }]")
</template>

<script>
import RadioGroup from './RadioGroup'
import RangeInput from './RangeInput'
import { SET_DATAPOINTS, SET_DATASET, CASES, DEATHS, SET_MAP, POPULATION, VALUES } from '@/store'
import { mapGetters } from 'vuex'

export default {
  components: { RadioGroup, RangeInput },
  data: () => ({
    CASES,
    DEATHS,
    POPULATION,
    VALUES,
    dataset: '0',
    datasets: [{
      value: '0', label: 'Active Cases'
    }, {
      value: '1', label: 'Total Cases'
    }, { 
      value: '2', label: 'Deaths'
    }]
  }),
  computed: {
    ...mapGetters(['formattedActiveDate']),
    // dataset: {
    //   get () {
    //     return this.$store.state.dataset
    //   },
    //   set (val) {
    //     if (val === DEATHS) this.$store.commit(SET_MAP, '0')
    //     this.$store.commit(SET_DATASET, val)
    //   }
    // },
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
  },
  watch: {
    dataset (val) {
      if (val === '0') {
        this.$store.commit(SET_DATASET, CASES)
        this.$store.commit(SET_MAP, '2')
      }

      if (val === '1') {
        this.$store.commit(SET_DATASET, CASES)
        this.$store.commit(SET_MAP, '0')
      }

      if (val === '2') {
        this.$store.commit(SET_DATASET, DEATHS)
        this.$store.commit(SET_MAP, '0')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.controls { width: 100%; }

.title {
  padding: 10px 10px 0;
}

h1 {
  @include flex(center, space-between);
  font-weight: 700;

  strong { font-weight: 300; }
}

form {
  padding: 10px;
}

hr {
  @include size(100%, 1px);
  background: rgba(255, 255, 255, .2);
  border: 0;
  margin: 10px 0;
}
</style>