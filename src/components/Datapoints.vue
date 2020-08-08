<template lang="pug">
Canvas(ref="canvas")
</template>

// <script>
import * as d3 from 'd3'
import Canvas from '@/components/Canvas'
import { mapGetters, mapState } from 'vuex'
import { Sprite } from '@/util/canvas'
import { POPULATION } from '@/store'

export default {
  props: {
    projection: {
      type: Function,
      default: () => ({})
    },
    transform: {
      type: Object,
      required: true
    }
  },
  components: { Canvas },
  computed: {
    ...mapGetters(['datapoints']),
    ...mapState({
      map: s => s.map,
      dataset: s => s.datapoints
    })
  },
  watch: {
    datapoints () {
      this.paint()
    },
    transform () {
      this.paint()
    }
  },
  async mounted () {
    await this.$nextTick()
    this.initScales()
    this.createSprite()
    this.paint()
    window.addEventListener('resize', this.onResize.bind(this))
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize.bind(this))
  },
  methods: {
    initScales () {
      const { size } = this.$refs.canvas
      this.viewportScale = d3.scaleLinear([0, 1920], [0, 1])
      const scale = this.viewportScale(size[0])
      this.sizeScale = d3.scaleLog([1, 50, 10000, 100000], [1 * scale, 5 * scale, scale * 30, scale * 30 * 4])
    },
    createSprite () {
      const pointSize = 100
      this.sprite = new Sprite({ width: pointSize, height: pointSize, paint () {
        this.ctx.beginPath()
        this.ctx.arc(pointSize / 2, pointSize / 2, pointSize / 3, 0, Math.PI * 2)
        this.ctx.strokeStyle = '#FF0032'
        this.ctx.fillStyle = '#FF0032'
        this.ctx.shadowBlur = pointSize / 4
        this.ctx.shadowColor = '#6B0894'
        this.ctx.lineWidth = pointSize / 20
        this.ctx.fill()
        this.ctx.stroke()
      }})
    },
    paint () {
      const { ctx, size } = this.$refs.canvas
      const [width, height] = size
      ctx.clearRect(0, 0, width, height)
      this.datapoints.forEach(({ datum, value }) => {
        const coords = this.projection([datum.lon, datum.lat])
        if (coords) {
          ctx.beginPath()
          const [x, y] = this.transform.apply(coords)
          const size = this.dataset === POPULATION ? value * 8 : this.sizeScale(value)
          ctx.drawImage(this.sprite.canvas, x - (size/2), y - (size/2), size, size)
        }
      })
    },
    async onResize () {
      await this.$nextTick()
      this.initScales()
      this.paint()
    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
  z-index: 50;
  position: relative;
  pointer-events: none;
}
</style>