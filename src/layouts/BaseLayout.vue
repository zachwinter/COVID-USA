<template lang="pug">
main.base
  aside.aside
    slot(name="aside")
  section.section
    slot(name="map")
</template>

<style lang="scss">
.base {
  @include size(100vw, 100vh);
  @include flex(flex-start, flex-start, row);

  @include max-width(mobile) {
    @include flex(flex-start, flex-start, column-reverse);
  }

  .aside {
    @include flex-width($aside-width);
    height: 100%;
    background: $dark-purple;
    color: #fff;
    font-size: 12px;
    overflow: hidden;

    @include max-width(mobile) {
      @include flex-width(100%);
      @include flex-height($aside-height);
      overflow-y: auto;
    }

    @include mobile-landscape {
      overflow-y: auto;
    }
  }

  .section {
    @include size(100%);
    position: relative;
    
    canvas { @include position(absolute, 0 0 0 0); }

    @include max-width(mobile) {
      @include size(100%, calc(100% - #{$aside-height}));
    }
  }
}
</style>