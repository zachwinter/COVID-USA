import { createCanvas, sizeCtx, TWO_PI } from '../util/canvas'
// import usa from '../data/usa.json'
// import locations from '../data/locations.json'
// import days from '../data/total.json'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import Sprite from './Sprite'
import Observe from '../util/observe'
// import { createElement } from '@/util/dom'

const COORDS = {}

export default class Map {
  constructor ({ container, dataset, caseIndex, data, usa }) {
    this.usa = usa
    this.data = data
    this.container = container
    this.state = {
      dataset,
      width: container.offsetWidth,
      height: container.offsetHeight,
      dpi: window.devicePixelRatio,
      transform: d3.zoomIdentity,
      hover: null,
      day: this.data.days[0],
      index: 0,
      caseIndex,
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

    // if ('__OffscreenCanvas' in window) {
    //   this.initWorker()
    //   this.state = Observe(this.state)
    //   return
    // }
 
    this.state = Observe(this.state)
    this.initCanvas()
    this.initScales()
    this.initProjection()
    this.initZoom()
    this.initMouse()
    this.initKeyboard()
    this.watch()
    this.paintMap()
    window.addEventListener('resize', this.onResize.bind(this))
  }

  // initWorker () {
  //   const worker = new Worker('../workers/map.worker.js', { type: 'module' });

  //   worker.postMessage({
  //     type: 'INIT',
  //     payload: this.state
  //   })

  //   const c = (canvas) => {
  //     canvas.width = this.state.width * window.devicePixelRatio
  //     canvas.height = this.state.height * window.devicePixelRatio
  //     canvas.style.width = this.state.width + 'px'
  //     canvas.style.height = this.state.height + 'px'
  //   }

  //   const map = createElement('canvas', this.container)
  //   const cases = createElement('canvas', this.container)
  //   c(map)
  //   c(cases)
  //   const offscreenMap = map.transferControlToOffscreen()
  //   const offscreenCases = map.transferControlToOffscreen()
  //   worker.postMessage({ type: 'MAP_CANVAS', payload: offscreenMap }, [offscreenMap])
  //   worker.postMessage({ type: 'CASES_CANVAS', payload: offscreenCases }, [offscreenCases])
  // }

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
    this.state.watch('index', val => {
      this.state.day = this.data.days[val]
      this.paintCases()
      this.state.hover = this.state.hover ? this.buildToolTip(this.state.hover.county.fips) : null
    })

    this.state.watch('transform', () => {
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

    this.state.watch('dataset', () => {
      this.paintCases()
      this.state.hover = this.state.hover ? this.buildToolTip(this.state.hover.county.fips) : null
    })
  }

  initProjection () {
    this.state.transform = d3.zoomIdentity
    if (this.zoom) d3.select('canvas.cursor').call(this.zoom.transform, d3.zoomIdentity)
    this.projection = d3.geoAlbersUsa().fitExtent([[20, 20], [this.state.width - 20, this.state.height - 20]], topojson.feature(this.usa, this.usa.objects.states))
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
      const multiplier = window.devicePixelRatio

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
        path(topojson.feature(self.usa, self.usa.objects.states))
        this.ctx.lineWidth = self.featureScale(self.state.width) / 2
        this.ctx.strokeStyle = self.state.colors.stateStroke
        this.ctx.stroke()
        this.ctx.beginPath()
        path(topojson.feature(self.usa, self.usa.objects.nation))
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
    self.data.locations.forEach(location => {
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
    const location = this.data.locations.find(({ fips }) => fips === ID)
    return {
      county: {
        ...location,
        total: this.state.day[ID].total,
        delta: this.state.day[ID].delta,
      },
      state: {
        ...this.state.day[location.state],
        name: location.state
      },
      country: {
        total: this.state.day.meta.total,
        delta: this.state.day.meta.delta
      }
    }
  } 

  initKeyboard () {
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown ({ keyCode }) {
    if (keyCode === 37 && this.state.index !== 0) this.state.index--
    if (keyCode === 39 && this.state.index !== this.data.days.length - 1) this.state.index++
  }

  cacheCoordinates () {
    this.data.locations.forEach(({ fips, lat, lon }) => {
      COORDS[fips] = this.projection([lon, lat])
    })
  }

  onResize () {
    this.state.width = this.container.offsetWidth
    this.state.height = this.container.offsetHeight
    sizeCtx({ ctx: this.mapCtx, width: this.state.width, height: this.state.height })
    sizeCtx({ ctx: this.casesCtx, width: this.state.width, height: this.state.height })
    sizeCtx({ ctx: this.cursorCtx, width: this.state.width, height: this.state.height })
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
    const dataset = this.state.dataset.toLowerCase()
    this.clearCases()
    this.casesCtx.save()
    this.casesCtx.beginPath()
    for (let key in this.state.day) {
      if (COORDS[key]) {
        const cases = this.state.day[key][0][0]
        const deaths = this.state.day[key][1][0]
        const [x, y] = this.state.transform.apply(COORDS[key])
        const size = this.sizeScale(dataset === 'deaths' ? deaths : cases)
        this.point.applyTo(this.casesCtx, x, y, size, size)
      }
    }
    this.casesCtx.fill()
    this.casesCtx.restore()
  }

  paintCursor () {
    this.clearCursor()
    if (this.state.hover === null) return
    const key = this.state.hover.county.fips
    const [x, y] = this.state.transform.apply(COORDS[key])
    this.cursorCtx.save()
    this.cursorCtx.lineWidth = 2
    this.cursorCtx.strokeStyle = 'white'
    this.cursorCtx.beginPath()
    const radius = Math.max(this.sizeScale(this.state.day[key][this.state.caseIndex][0]) / 2, 15)
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
    document.removeEventListener('keydown', this.onKeyDown.bind(this))
  }
}