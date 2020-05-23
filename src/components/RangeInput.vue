<template lang="pug">
input(type="range" :min="min" :max="max" step="1" :value="value" @input="onInput")
</template>

<script>
export default {
  props: {
    value: {
      required: true
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 50
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', parseInt(e.target.value, 10))
    }
  }
}
</script>

<style lang="scss" scoped>
input {
  @include size(100%, 5px);
  appearance: none;
  outline: 0;
  border: 0;
}

@mixin thumb {
  @include size(20px);
  border: 0;
  outline: 0;
  appearance: none;
  background: $red;
  border-radius: 100%;
}

input::-webkit-slider-thumb {
  @include thumb;
}

input::-moz-range-thumb {
  @include thumb;
}
</style>