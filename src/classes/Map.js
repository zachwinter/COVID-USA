import { createCanvas, sizeCtx, TWO_PI } from '../util/canvas'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import Sprite from './Sprite'
import Observe from '../util/observe'

const COORDS = {}
const TRANSFORMED_COORDS = {}

export default class Map {
  constructor ({ container, data, usa, datapoints, activeDataset }) {
    this.usa = usa
    this.data = data
    this.container = container
    this.state = {
      width: container.offsetWidth,
      height: container.offsetHeight,
      dpi: window.devicePixelRatio,
      transform: d3.zoomIdentity,
      hover: null,
      datapoints,
      index: 0,
      activeDataset,
      mouse: [0, 0],
      colors: {
        background: `#FBD0D0`,
        countyFill: '#3B183F',
        countyStroke: 'rgb(143, 86, 145)',
        stateStroke: '#26022B',
        nationStroke: '#26022B',
        pointColor: '#FF0032',
        pointShadow: '#6B0894'
      },
      pointSize: 30
    }
 
    this.state = Observe(this.state)
    this.initCanvas()
    this.initScales()
    this.initProjection()
    this.initZoom()
    this.initMouse()
    this.watch()
    this.paintMap()
    window.addEventListener('resize', this.onResize.bind(this))
  }

  initCanvas () {
    const { canvas: mapCanvas, ctx: mapCtx } = createCanvas({ target: this.container, width: this.state.width, height: this.state.height, alpha: false })
    const { canvas: casesCanvas, ctx: casesCtx } = createCanvas({ target: this.container, width: this.state.width, height: this.state.height })
    const { canvas: cursorCanvas, ctx: cursorCtx } = createCanvas({ target: this.container, width: this.state.width, height: this.state.height })
    this.mapCanvas = mapCanvas
    this.mapCtx = mapCtx
    this.casesCanvas = casesCanvas
    this.casesCanvas.style.zIndex = 2    
    this.casesCanvas.classList.add('cases')
    this.casesCtx = casesCtx
    this.cursorCanvas = cursorCanvas
    this.cursorCanvas.classList.add('cursor')
    this.cursorCtx = cursorCtx
    this.cursorCanvas.style.zIndex = 3
  }

  watch () {
    this.state.watch('transform', () => {
      this.cacheTransformedCoordinates()
      this.paint()
      this.state.hover = null
    })

    this.state.watch('hover', (val, old) => {
      if (val && val !== old) {
        this.paintCursor()
      } else {
        this.clearCursor()
      }
    })

    this.state.watch('activeDataset', () => {
      this.paintCases()
    })
  }

  initProjection () {
    this.state.transform = d3.zoomIdentity
    if (this.zoom) d3.select('canvas.cursor').call(this.zoom.transform, d3.zoomIdentity)
    this.projection = d3.geoAlbersUsa().fitExtent([[20, 20], [this.state.width - 20, this.state.height - 40]], topojson.feature(this.usa, this.usa.objects.states))
    this.buildSprites()
    this.cacheCoordinates()
  }

  initScales () {
    this.viewportScale = d3.scaleLinear([0, 1920], [.6, 1])
    const scale = this.viewportScale(this.state.width)
    this.sizeScale = d3.scaleLog([1, 50, 10000, 100000], [1 * scale, 5 * scale, scale * 30, scale * 30 * 4])
    this.featureScale = d3.scaleLinear([0, 1920], [0, 5])
  }

  buildSprites ({ point = true, map = true } = {}) {
    const self = this

    if (point) {
      const pointSize = 80

      this.point = new Sprite({ width: pointSize, height: pointSize, paint () {
        this.ctx.beginPath()
        this.ctx.arc(pointSize / 2, pointSize / 2, pointSize / 3, 0, TWO_PI)
        this.ctx.strokeStyle = self.state.colors.pointColor
        this.ctx.fillStyle = self.state.colors.pointColor
        this.ctx.shadowBlur = pointSize / 4
        this.ctx.shadowColor = self.state.colors.pointShadow
        this.ctx.lineWidth = pointSize / 20
        this.ctx.fill()
        this.ctx.stroke()
      }})
    }

    if (map) {
      const multiplier = Math.min(window.devicePixelRatio, 2)

      this.map = new Sprite({ width: this.state.width * multiplier, height: this.state.height * multiplier, paint () {
        this.ctx.scale(multiplier, multiplier)
        const path = d3.geoPath(self.projection, this.ctx)
        this.ctx.beginPath()
        path(topojson.feature(self.usa, self.usa.objects.counties))
        this.ctx.lineWidth = self.featureScale(self.state.width) / 10
        this.ctx.fillStyle = self.state.colors.countyFill
        this.ctx.strokeStyle = self.state.colors.countyStroke
        this.ctx.fill()
        this.ctx.stroke()
        this.ctx.beginPath()
        path(topojson.mesh(self.usa, self.usa.objects.states))
        this.ctx.lineWidth = self.featureScale(self.state.width) / 2
        this.ctx.strokeStyle = self.state.colors.stateStroke
        this.ctx.stroke()
        this.ctx.beginPath()
        path(topojson.mesh(self.usa, self.usa.objects.nation))
        this.ctx.lineWidth = self.featureScale(self.state.width)
        this.ctx.strokeStyle = self.state.colors.nationStroke
        this.ctx.stroke()
      }})
    }   
  }

  initZoom () {
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [this.state.width, this.state.height]])
      .on('zoom', () => {
        this.state.transform = d3.event.transform
      })
      .filter(function () {
        if (typeof TouchEvent !== 'undefined' && d3.event instanceof TouchEvent) {
          return d3.event.touches.length > 1
        }
        return true
      })
    this.zoom.touchable()
    d3.select('canvas.cursor').call(this.zoom)
  }

  initMouse () {
    const self = this
    d3.select(this.container).on('mousemove', function () {
      self.onPointerMove.call(this, self)
    })
    d3.select(this.container).on('touchmove', function () {
      if (d3.event.target.classList.contains('no-touch')) return
      self.onPointerMove.call(this, self)
    })
  }

  onPointerMove (self) {
    self.state.mouse = d3.mouse(this)
    const coords1 = self.projection.invert(self.state.transform.invert(self.state.mouse))
    let distance = null
    let match = null
    self.data.counties.forEach(location => {
      const coords2 = [location.lon, location.lat]
      const dist = d3.geoDistance(coords1, coords2)
      if (distance === null || dist < distance) {
        distance = dist
        match = location.fips
      }
    })
    self.state.hover = distance < .02 ? self.buildToolTip(match) : null
  }

  buildToolTip (ID) {
    return this.state.activeDataset.find(({ datum }) => datum.fips === ID) || null
  } 

  cacheCoordinates () {
    this.data.counties.forEach(({ fips, lat, lon }) => {
      COORDS[fips] = this.projection([lon, lat])
    })

    this.cacheTransformedCoordinates()
  }

  cacheTransformedCoordinates () {
    this.data.counties.forEach(({ fips }) => {
      if (COORDS[fips]) TRANSFORMED_COORDS[fips] = this.state.transform.apply(COORDS[fips])
    })
  }

  onResize () {
    this.state.width = this.container.offsetWidth
    this.state.height = this.container.offsetHeight
    const { width, height } = this.state
    sizeCtx({ ctx: this.mapCtx, width, height })
    sizeCtx({ ctx: this.casesCtx, width, height })
    sizeCtx({ ctx: this.cursorCtx, width, height })
    this.initProjection()
    this.initZoom()
    this.paint()
  }

  clearMap () {
    this.mapCtx.save()
    this.mapCtx.fillStyle = this.state.colors.background
    this.mapCtx.fillRect(0, 0, this.state.width, this.state.height)
    this.mapCtx.restore()
  }

  clearCases () {
    this.casesCtx.save()
    this.casesCtx.fillStyle = this.state.colors.background
    this.casesCtx.clearRect(0, 0, this.state.width, this.state.height)
    this.casesCtx.restore()
  }

  clearCursor () {
    this.cursorCtx.clearRect(0, 0, this.state.width, this.state.height)
  }
  
  paintMap () {
    this.clearMap()
    this.mapCtx.save()  
    this.mapCtx.translate(this.state.transform.x, this.state.transform.y)
    this.mapCtx.scale(this.state.transform.k, this.state.transform.k)
    this.mapCtx.drawImage(this.map.canvas, 0, 0, this.state.width, this.state.height)
    this.mapCtx.restore()
  }

  paintCases () {
    this.clearCases()
    this.state.activeDataset.forEach(({ datum, value }) => {
      if (TRANSFORMED_COORDS[datum.fips]) {
        const [x, y] = TRANSFORMED_COORDS[datum.fips]
        const size = this.state.datapoints === 'POPULATION' ? value * 8 : this.sizeScale(value)
        this.point.applyTo(this.casesCtx, x, y, size, size)
      }
    })
  }

  paintCursor () {
    this.clearCursor()
    if (this.state.hover === null) return
    const fips = this.state.hover.datum.fips
    const value = this.state.hover.value
    const [x, y] = TRANSFORMED_COORDS[fips]
    this.cursorCtx.save()
    this.cursorCtx.lineWidth = 2
    this.cursorCtx.strokeStyle = 'white'
    this.cursorCtx.beginPath()
    const radius = (this.state.datapoints === 'POPULATION' ? value * 8 : this.sizeScale(value)) / 2
    this.cursorCtx.arc(x, y, radius, 0, Math.PI * 2)
    this.lastCursor = { x, y, radius }
    this.cursorCtx.closePath()
    this.cursorCtx.stroke()
    this.cursorCtx.restore()
  }
  
  paint () {
    this.paintMap()
    this.paintCases()
  }

  destroy () {
    this.mapCanvas.remove()
    this.casesCanvas.remove()
    window.removeEventListener('resize', this.onResize.bind(this))
  }
}