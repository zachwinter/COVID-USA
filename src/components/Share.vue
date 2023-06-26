<template>
  <div>
    <button @click="share">
      <ShareIcon />
    </button>

    <button>
      <GithubIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import ShareIcon from '../assets/share.svg?component';
import GithubIcon from '../assets/github.svg?component';

const data = useData();

function share() {
  const day = data.date.getDate()
  const month = data.date.getMonth()
  const year = data.date.getFullYear()
  const link = `${window.location.host}#${(month + 1) < 10 ? '0' : ''}${month + 1}${day < 10 ? '0' : ''}${day}${year}`;
  navigator.clipboard.writeText(link);
}
</script>

<style lang="scss" scoped>
div {
  @include position(fixed, 0 notch(right) null null);
  @include flex(center, center, row);
  z-index: 5;
}
button {
  @include strip;
  @include size(px(40));
  background: rgba(darken(map-get($colors, 'purple'), 10%), 0.97);

  &:first-child {
    border-right: 1px solid rgba(255, 255, 255, 0.15);
  }
}

svg {
  @include size(60%, auto);

  :deep(*) {
    fill: var(--white);
  }
}
</style>
