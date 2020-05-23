<template lang="pug">
div(ref="container" :style="{ height: height + 'px', 'margin-bottom': xAxisHeight + 'px' }").bar-chart
  div(v-if="width")
    canvas(ref="canvas" :width="(width - yAxisWidth) * dpi" :height="height * dpi" :style="{ width: `calc(100% - ${yAxisWidth}px)`, left: yAxisWidth + 'px' }")
    svg(ref="svg" class="x-axis" :width="width - yAxisWidth" :height="xAxisHeight" :style="{ 'left': yAxisWidth + 'px' }")
      g(ref="xAxis")
    svg(ref="svg" class="y-axis" :width="yAxisWidth" :height="height")
      g(ref="yAxis" :style="{ transform: `translateX(${yAxisWidth}px)` }")
</template>

<script>
import * as d3 from 'd3'

export default {
  props: {
    height: {
      type: Number,
      default: 120,
    },
    model: Array,
    yAxisWidth: {
      type: Number,
      default: 40
    },
    xAxisHeight: {
      type: Number,
      default: 20
    },
    transitionDuration: {
      type: Number,
      default: 150
    },
    index: Number,
    tween: {
      type: Boolean,
      default: true
    }
  },

  data: () => ({
    dpi: window.devicePixelRatio,
    width: null
  }),

  watch: {
    model (val) {
      if (val.length) {
        this.setScales()
        this.render()
      }
    },
    async width () {
      await this.$nextTick()
      this.initCtx()
      this.setScales()
      this.render()
    },
    async height () {
      await this.$nextTick()
      this.initCtx()
      this.setScales()
      this.render()
    },
    index () {
      this.render()
    }
  },

  mounted () {
    this.setWidth()
    this.initCtx()
    this.setScales()
    this.render()
    window.addEventListener('resize', this.setWidth.bind(this))
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.setWidth.bind(this))
  },

  methods: {
    setWidth () {
      this.width = this.$el.offsetWidth
    },
    setScales () {
      let max = d3.max(this.model.map(d => d.value))
      if (max === 0) max = 10
      this.xScale = d3.scaleTime([new Date(this.model[0].date), new Date(this.model[this.model.length -1].date)], [0, this.width - this.yAxisWidth])
      this.yScale = d3.scaleLinear([0, max], [this.height, 0])
      this.initAxis()
    },

    initAxis () {
      d3.select(this.$refs.xAxis).call(d3.axisBottom(this.xScale.nice()).ticks(5))
      const transition = d3.transition()
        .duration(this.transitionDuration)
        .ease(d3.easeLinear)

      if (this.tween) {
        d3.select(this.$refs.yAxis)
          .transition(transition)
          .call(d3.axisLeft(this.yScale.nice()).ticks(6))
      } else {
        d3.select(this.$refs.yAxis).call(d3.axisLeft(this.yScale.nice()).ticks(6))
      }
    },

    initCtx () {
      if (!this.$refs || !this.$refs.canvas) return
      this.ctx = this.$refs.canvas.getContext('2d')
      this.ctx.resetTransform()
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      this.ctx.fillStyle = 'white'
    },

    clear () {
      if (!this.ctx) return
      this.ctx.save()
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.ctx.fillStyle = 'rgba(255, 255, 255, .05)'
      this.ctx.fillRect(0, 0, this.width, this.height)
      this.ctx.restore()
    },

    render () {
      if (!this.ctx) return
      if (this.tween && this.coords) return this.tweenTo()
      this.clear()
      this.coords = this.model.map(({ date, value }) => {
        return {
          x: this.xScale(new Date(date)),
          y: this.yScale(value)
        }
      })
      this.coords.forEach(({ x, y }, i) => {
        this.ctx.save()
        if (i === this.index) this.ctx.fillStyle = '#FF0032'
        this.ctx.fillRect(x, y, 1, this.height - y)
        this.ctx.restore()
      })
    },

    tweenTo () {
      if (this.timer) this.timer.stop()
      const from = this.coords
      const to = this.model.map(({ date, value }) => {
        return {
          x: this.xScale(new Date(date)),
          y: this.yScale(value)
        }
      })
      if (!from) return
      const interpolators = from.map(({ x, y }, i) => {
        return {
          x: d3.interpolateNumber(x, to[i].x),
          y: d3.interpolateNumber(y, to[i].y)
        }
      })

      this.timer = d3.timer(elapsed => {
        const progress = d3.easeCubicInOut(Math.min(elapsed / this.transitionDuration, 1))
        this.clear()
        this.coords = interpolators.map(({ x, y }) => {
          return {
            x: x(progress),
            y: y(progress)
          }
        })
        this.coords.forEach(({ x, y }, i) => {
          this.ctx.save()
          if (i === this.index) this.ctx.fillStyle = 'red'
          this.ctx.fillRect(x, y, 1, this.height - y)
          this.ctx.restore()
        })
        if (progress === 1) this.timer.stop()
      })
    } 
  }
}
</script>

<style lang="scss" scoped>
.bar-chart {
  position: relative;
}

canvas {
  @include position(absolute, 0 null null 0);
  height: 100%;
}

svg {
  @include position(absolute, null 0 -20px 0);
  &.y-axis {  @include position(absolute, 0 null 0 0); }
}
</style> 

<style lang="scss">
.bar-chart .domain { display: none; }
</style>