<template lang="pug">
form
  .flex
    .date {{ formattedActiveDate }}
    RadioGroup(v-model="dataset" :options="[{ value: CASES, label: 'Cases' }, { value: DEATHS, label: 'Deaths' }]")
  RangeInput(:min="0" :max="totalDays" :step="1" v-model="index")
</template>

<script>
import { mapGetters } from 'vuex'
import RadioGroup from './RadioGroup'
import RangeInput from './RangeInput'
import { SET_DATASET, SET_INDEX, CASES, DEATHS } from '@/store'

export default {
  components: { RadioGroup, RangeInput },
  data: () => ({
    [CASES]: CASES,
    [DEATHS]: DEATHS
  }),
  computed: {
    ...mapGetters(['totalDays', 'formattedActiveDate']),
    dataset: {
      get () {
        return this.$store.state.dataset
      },
      set (val) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
form {
  padding: 20px;

  @include max-width(mobile) {
    padding: 10px;
  }
}

.flex {
  @include flex(center, space-between);
  margin-bottom: 5px;
}

.date {
  font-weight: 700;
}
</style>