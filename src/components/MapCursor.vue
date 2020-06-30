<template lang="pug">
Canvas(ref="canvas")
</template>

<script>
import Canvas from '@/components/Canvas'
// import * as d3 from 'd3'
import { Sprite } from '@/util/canvas'

export default {
  props: {
    mouse: {
      type: Array,
      required: true
    },
    hover: {
      type: Object,
      default: null
    },
    projection: {
      type: Function,
      default: () => {}
    }
  },
  data: () => ({
    lifespan: 1000,
    circle: [0, 0],
    mice: []
  }),
  components: { Canvas },
  mounted () {
    requestAnimationFrame(this.paint.bind(this))
    this.sprite = new Sprite({ width: 400, height: 400, paint () {
      this.ctx.beginPath()
      this.ctx.arc(this.width/2, this.height/2, this.width/2, 0, Math.PI * 2)
      this.ctx.closePath()
      this.ctx.stroke()
    }})
  },
  methods: {
    paint () {

    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
  z-index: 10;
  pointer-events: none;
}
</style>