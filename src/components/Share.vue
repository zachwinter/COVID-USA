<template>
  <div>
    <button @click="share">
      <ShareIcon />
    </button>

    <a href="http://github.com/zachwinter/COVID-USA" target="github">
      <GithubIcon />
    </a>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import ShareIcon from '../assets/share.svg?component';
import GithubIcon from '../assets/github.svg?component';
import { copyToClipboard } from '../util/clipboard'
const data = useData();
const toast = useToast();

function share() {
  const day = data.date.getDate()
  const month = data.date.getMonth()
  const year = data.date.getFullYear()
  const link = `${window.location.protocol}//${window.location.host}#${(month + 1) < 10 ? '0' : ''}${month + 1}${day < 10 ? '0' : ''}${day}${year}`;
  copyToClipboard(link)
  toast.message('Link copied to clipboard.')
}
</script>

<style lang="scss" scoped>
div {
  @include position(fixed, 0 notch(right) null null);
  @include flex(center, center, row);
  z-index: 5;
}

button, a {
  @include strip;
  @include size(px(40));
  @include flex;
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
