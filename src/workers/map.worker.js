import Observe from '@/util/observe'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import usa from '../data/usa.json'
import locations from '../data/locations.json'
// import days from '../data/days.json'

// TO DO... all of it

const TWO_PI = Math.PI * 2
const COORDS = {}
let STATE = null

export default class Sprite {
  constructor ({ width, height, paint }) {
    const { canvas, ctx } = createCanvas({ width, height })
    this.width = width
    this.height = height
    this.canvas = canvas
    this.ctx = ctx
    paint.call(this)
  }

  applyTo (ctx, x, y, width, height) {
    ctx.drawImage(this.canvas, x - (width/2), y - (height/2), width, height)
  }
}

onmessage = ({ data }) => {
  const { type, payload, canvas } = data

  if (canvas) {
    STATE.canvas = canvas
    STATE.ctx = STATE.canvas.getContext('2d')
    STATE.ctx.scale(STATE.dpi, STATE.dpi)
    initialize()
  }

  switch (type) {
    case 'INIT':
      STATE = Observe(payload)
      break
    default:
      return
  }
}

function initialize () {
  initScales()
  initProjection()
}

function createCanvas ({ width, height }) {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.scale(STATE.dpi, STATE.dpi)
  return { canvas, ctx }
}

function initProjection () {
  const padding = 20
  STATE.projection = d3.geoAlbersUsa().fitExtent([[320, padding], [STATE.width - padding, STATE.height - padding]], topojson.feature(usa, usa.objects.states))
  buildSprites()
  cacheCoordinates()
}

function initScales () {
  STATE.viewportScale = d3.scaleLinear([0, 1920], [.6, 1])
  const scale = STATE.viewportScale(STATE.width)
  STATE.sizeScale = d3.scaleLog([1, 50, 10000, 100000], [1 * scale, 5 * scale, scale * 30, scale * 30 * 4])
  STATE.featureScale = d3.scaleLinear([0, 1920], [0, 5])
}

function buildSprites ({ point = true, map = true } = {}) {
  if (point) {
    const pointSize = 200

    STATE.pointSprite = new Sprite({ width: pointSize, height: pointSize, paint () {
      this.ctx.beginPath()
      this.ctx.arc(pointSize / 2, pointSize / 2, pointSize / 3, 0, TWO_PI)
      this.ctx.strokeStyle = STATE.colors.pointColor
      this.ctx.fillStyle = STATE.colors.pointColor
      this.ctx.shadowBlur = pointSize / 4
      this.ctx.shadowColor = STATE.colors.pointShadow
      this.ctx.lineWidth = pointSize / 20
      this.ctx.fill()
      this.ctx.stroke()
    }})
  }

  if (map) {
    STATE.mapSprite = new Sprite({ width: STATE.width * STATE.dpi, height: STATE.height * STATE.dpi, paint () {
      this.ctx.scale(STATE.dpi, STATE.dpi)
      const path = d3.geoPath(STATE.projection, this.ctx)
      this.ctx.beginPath()
      path(topojson.feature(usa, usa.objects.counties))
      this.ctx.lineWidth = STATE.featureScale(STATE.width) / 10
      this.ctx.fillStyle = STATE.colors.countyFill
      this.ctx.strokeStyle = STATE.colors.countyStroke
      this.ctx.fill()
      this.ctx.stroke()
      this.ctx.beginPath()
      path(topojson.feature(usa, usa.objects.states))
      this.ctx.lineWidth = STATE.featureScale(STATE.width) / 2
      this.ctx.strokeStyle = STATE.colors.stateStroke
      this.ctx.stroke()
      this.ctx.beginPath()
      path(topojson.feature(usa, usa.objects.nation))
      this.ctx.lineWidth = STATE.featureScale(STATE.width)
      this.ctx.strokeStyle = STATE.colors.nationStroke
      this.ctx.stroke()
    }})
  }   
}

function cacheCoordinates () {
  locations.forEach(({ fips, lat, lon }) => {
    COORDS[fips] = STATE.projection([lon, lat])
  })
}

// function clearMap () {
//   this.mapCtx.save()
//   this.mapCtx.fillStyle = this.state.colors.background
//   this.mapCtx.fillRect(0, 0, this.state.width, this.state.height)
//   this.mapCtx.restore()
// }

// function paintMap () {
//   this.clearMap()
//   this.mapCtx.save()  
//   this.mapCtx.translate(this.state.transform.x, this.state.transform.y)
//   this.mapCtx.scale(this.state.transform.k, this.state.transform.k)
//   this.mapCtx.drawImage(this.map.canvas, 0, 0, this.state.width, this.state.height)
//   this.mapCtx.restore()
// }
