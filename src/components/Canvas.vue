<template lang="pug">
canvas(ref="canvas" :class="{ flexible }" :width="artboard[0]" :height="artboard[1]")
</template>

<script>
const props = {
  width: {
    type: Number,
    default: window.innerWidth
  },
  height: {
    type: Number,
    default: window.innerHeight
  },
  flexible: {
    type: Boolean,
    default: true
  },
  dpi: {
    type: Number,
    default: window.devicePixelRatio
  }
}

export default {
  props, 
  data: () => ({
    artboard: [0, 0]
  }),
  computed: {
    size () {
      return this.artboard.map(v => v / this.dpi)
    }
  },
  created () {
    window.addEventListener('resize', this.setArtboard.bind(this))
    this.ctx = new Proxy({}, {
      get: () => () => {},
      set: () => {}
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.setArtboard.bind(this))
  },
  mounted () {
    this.setArtboard()
    this.initCtx()
  },
  methods: {
    fillParent () {
      const { offsetWidth, offsetHeight } = this.$el.parentElement
      const { position } = window.getComputedStyle(this.$el.parentElement)
      if (position === 'static') this.$el.parentElement.style.position = 'relative'
      this.artboard = [offsetWidth, offsetHeight].map(v => v * this.dpi)
    },
    initCtx () {
      if (!this.$refs.canvas) return
      this.ctx = this.$refs.canvas.getContext('2d')
      this.ctx.resetTransform()
      this.ctx.scale(this.dpi, this.dpi)
    },
    clear () {
      this.ctx.clearRect(0, 0, this.size[0], this.size[1])
    },
    async setArtboard () {
      if (this.flexible) {
        this.fillParent()
      } else {
        this.artboard = [this.width, this.height].map(v => v * this.dpi)
      }
      await this.$nextTick()
      this.initCtx()
    },
    onResize () {
      if (this.flexible) this.fillParent()
    }
  }
}
</script>

<style lang="scss">
.flexible {
  @include position(absolute, 0 0 0 0);
  @include size(100%);
}
</style>
