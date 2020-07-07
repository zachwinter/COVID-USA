<template lang="pug">
.slider
  .date {{ formattedActiveDate }}
  RangeInput(:min="0" :max="totalDays" :step="1" v-model="index")
  button(@click.prevent="$store.dispatch('animate')") Animate
  GitHub
</template>

<script>
import { mapGetters } from 'vuex'
import { SET_INDEX } from '@/store'
import RangeInput from '@/components/RangeInput'
import GitHub from '@/components/GitHub'

export default {
  components: { RangeInput, GitHub },
  computed: {
    ...mapGetters(['totalDays', 'formattedActiveDate']),
      index: {
      get () {
        return this.$store.state.index
      },
      set (val) {
        this.$store.commit(SET_INDEX, val)
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.slider {
  @include size(calc(100% - 30px), 40px);
  @include position(absolute, null 0 15px 0);
  @include flex;
  margin: 0 auto;
  padding: 0 15px;
  z-index: 100;
  background: $dark-purple;
  color: $white;
  border-radius: 40px;
}

.date {
  font-weight: 700;
  width: 80px;
  flex-grow: 1;
  flex-shrink: 0;
}

button {
  @include clear;
  color: white;
  border: 1px solid white;
  font-weight: 300;
  padding: 3px;
  border-radius: 3px;
  margin: 0 10px;
  font-size: 10px;
  outline: 0;
}
</style>