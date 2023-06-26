<template>
  <div class="toggle">
    <label
      v-for="(option, i) in options"
      :key="i"
      :class="{ [option.text]: option.text }"
      @click="$emit('update:modelValue', option.value)"
    >
      <span>{{ option.text }}</span>
      <input
        type="radio"
        :checked="modelValue === option.value"
        name="toggle"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: any;
  options: { text: string; value: string }[];
}>();

defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.toggle {
  @include flex(center, center, row);
}

label {
  @include flex(center, center, row);
  gap: var(--base-spacer);
}
</style>
