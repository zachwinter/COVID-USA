<template>
  <aside>
    <slot></slot>
  </aside>
</template>

<style lang="scss" scoped>
aside {
  @include size(var(--sidebar-width), 100vh);
  @include flex(flex-start, flex-start, column);
  background: var(--purple);
}
</style>
