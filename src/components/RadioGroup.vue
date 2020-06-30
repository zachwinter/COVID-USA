<template lang="pug">
.radio-group
  label(v-for="(option, i) in options" :key="i" :class="{ disabled }")
    .radio-container
      input(type="radio" :disabled="disabled" :name="name" :value="options.value" :checked="option.value === value" @input="$emit('input', option.value)")
      i
    span {{ option.label }}
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.radio-group {
  @include flex(center, flex-start);

  label {
    @include flex(center, flex-start);
    width: 50%;
    text-align: left;

    &.disabled { opacity: .5 }
    // margin-left: 10px;
  }

  span { padding-left: 10px; }
}

.radio-container {
  @include size(20px);
  @include flex;
  background: white;
  border-radius: 15px;
  position: relative;
}

input {
  @include size(100%);
  @include position(absolute, 0 0 0 0);
  opacity: 0;
  appearance: none;
}

i {
  @include size(80%);
  background: $red;
  opacity: 0;
  transition: opacity $base-transition;
  border-radius: 100%;
}

input:checked + i { opacity: 1; }
</style>