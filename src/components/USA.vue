<template lang="pug">
.usa
  MapCursor(ref="cursor" :mouse="mouse" :hover="hover" :projection="projection")
  Canvas(ref="canvas")
</template>

<script>
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import Canvas from '@/components/Canvas'
import { Sprite } from '@/util/canvas'
import locations from '@/data/usa-locations'
import MapCursor from '@/components/MapCursor'

const props = {
  background: {
    type: String,
    default: '#FBD0D0'
  },
  countyFill: {
    type: String,
    default: '#3B183F',
  },
  countyStroke: {
    type: String,
    default: 'rgb(143, 86, 145)'
  },
  stateStroke: {
    type: String,
    default: '#26022B'
  },
  nationStroke: {
    type: String,
    default: '#26022B'
  },
  pointColor: {
    type: String,
    default: '#FF0032'
  },
  pointShadow: {
    type: String,
    default: '#6B0894'
  },
  mapData: {
    type: Object,
    default: null
  }
}
export default {
  props,
  components: { Canvas, MapCursor },
  data: () => ({
    transform: d3.zoomIdentity,
    mouse: [0, 0],
    hover: null,
    projection: null
  }),
  watch: {
    transform () {
      this.paint()
    }
  },
  async mounted () {
    this.initScales()
    this.initProjection()
    this.initZoom()
    this.initMouse()
    await this.$nextTick()
    this.paint()

    window.addEventListener('resize', this.onResize.bind(this))
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize.bind(this))
  },
  methods: {
    initScales () {
      const [width] = this.$refs.canvas.size
      this.viewportScale = d3.scaleLinear([0, 1920], [.6, 1])
      const scale = this.viewportScale(width)
      this.sizeScale = d3.scaleLog([1, 50, 10000, 100000], [1 * scale, 5 * scale, scale * 30, scale * 30 * 4])
      this.featureScale = d3.scaleLinear([0, 1920], [0, 5])
    },
    initProjection () {
      const [width, height] = this.$refs.canvas.size
      this.transform = d3.zoomIdentity
      if (this.zoom) d3.select(this.$refs.canvas.$el).call(this.zoom.transform, d3.zoomIdentity)
      this.projection = d3.geoAlbersUsa().fitExtent([[20, 20], [width - 20, height - 20]], topojson.feature(this.mapData, this.mapData.objects.states))
      this.$emit('projection', this.projection)
      this.createSprite()
    },
    createSprite () {
      const multiplier = window.devicePixelRatio
      const self = this
      const { artboard } = this.$refs.canvas
      const [width] = this.$refs.canvas.size
      this.sprite = new Sprite({ width: artboard[0] * multiplier, height: artboard[1] * multiplier, paint () {
        this.ctx.scale(multiplier, multiplier)
        const path = d3.geoPath(self.projection, this.ctx)
        this.ctx.beginPath()
        path(topojson.feature(self.mapData, self.mapData.objects.counties, (a, b) => a !== b))
        this.ctx.lineWidth = self.featureScale(width) / 10
        this.ctx.fillStyle = self.countyFill
        this.ctx.strokeStyle = self.countyStroke
        this.ctx.fill()
        this.ctx.stroke()
        this.ctx.beginPath()
        path(topojson.feature(self.mapData, self.mapData.objects.states))
        this.ctx.lineWidth = self.featureScale(width) / 2
        this.ctx.strokeStyle = self.stateStroke
        this.ctx.stroke()
        this.ctx.beginPath()
        path(topojson.mesh(self.mapData, self.mapData.objects.nation))
        this.ctx.lineWidth = self.featureScale(width)
        this.ctx.strokeStyle = self.nationStroke
        this.ctx.stroke()
      }})
    },
    initZoom () {
      const [width, height] = this.$refs.canvas.size
      this.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', () => {
          this.transform = d3.event.transform
          this.$emit('transform', this.transform)
        })
        .filter(function () {
          if (typeof TouchEvent !== 'undefined' && d3.event instanceof TouchEvent) {
            return d3.event.touches.length > 1
          }
          return true
        })
      this.zoom.touchable()
      d3.select(this.$refs.canvas.$el).call(this.zoom)
    },
    initMouse () {
      const self = this
      d3.select(this.$refs.canvas.$el).on('mousemove', function () {
        self.mouse = d3.mouse(this)
        self.$emit('mouse', self.mouse)
        const coords1 = self.projection.invert(self.transform.invert(self.mouse))
        let distance = null
        let match = null
        locations.forEach(location => {
          const coords2 = [location.lon, location.lat]
          const dist = d3.geoDistance(coords1, coords2)
          if (distance === null || dist < distance) {
            distance = dist
            match = location
          }
        })
        const final = distance < .02 ? match : null
        self.hover = final
        self.$emit('hover', final)
      })
    },
    paint () {
      const { ctx } = this.$refs.canvas
      const [width, height] = this.$refs.canvas.artboard
      ctx.save()
      ctx.fillStyle = this.background
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
      ctx.save()  
      ctx.translate(this.transform.x, this.transform.y)
      ctx.scale(this.transform.k, this.transform.k)
      ctx.drawImage(this.sprite.canvas, 0, 0, width, height)
      ctx.restore()
    },
    async onResize () {
      await this.$nextTick()
      this.initScales()
      this.initProjection()
      this.initZoom()
      this.paint()
    }
  }
}
</script>

<style lang="scss" scoped>
.usa {
  @include size(100%);
}
</style>