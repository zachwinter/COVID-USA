<template lang="pug">
a(href="https://github.com/zachwinter/COVID-USA" target="github"): GitHub
</template>

<script>
import GitHub from '@/assets/github.svg'
export default {
  components: { GitHub }
}
</script>

<style lang="scss" scoped>
a {
  @include size(20px);
  // @include position(absolute, null 15px 15px null);
  @include flex;
  background: $dark-purple;
  border-radius: 100%;
  z-index: 100;
}

svg {
  @include size(30px);

  * { fill: $white; }
}
</style>