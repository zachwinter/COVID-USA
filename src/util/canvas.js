import { createElement } from './dom'

export const PI = Math.PI
export const TWO_PI = PI * 2
export const PI_OVER_180 = PI / 180

export function createCanvas ({
  width = window.innerWidth,
  height = window.innerHeight, 
  dpi =  Math.min(window.devicePixelRatio, 2), 
  target = null,
  alpha = true
} = {}) {
  const canvas = createElement('canvas', target)
  const ctx = canvas.getContext('2d', { alpha })
  ctx.imageSmoothingQuality = 'high'
  sizeCtx({ ctx, width, height, dpi })
  return { canvas, ctx }
}

export function sizeCtx ({
  ctx, 
  width = window.innerWidth, 
  height = window.innerHeight, 
  dpi = window.devicePixelRatio
} = {}) {
  ctx.resetTransform()
  ctx.canvas.width = width * dpi
  ctx.canvas.height = height * dpi
  ctx.canvas.style.width = width + 'px'
  ctx.canvas.style.height = height + 'px'
  ctx.scale(dpi, dpi)
}

export function toRadians (angle) {
  return angle * PI_OVER_180
}

export function coords (radius, theta, cx = 0, cy = 0) {
  return {
    x: (radius * Math.cos(toRadians(theta)) + cx),
    y: (radius * Math.sin(toRadians(theta)) + cy)
  }
}

export function polygon (sides, radius, cx = 0, cy = 0, rotation = 0) {
  const angle = 360/sides
  const vertices = []

  for (var i = 0; i < sides; i++) {
    const _coords = coords(radius, (angle * i) + rotation, cx, cy)
    vertices.push(_coords)
  }

  return vertices
}

export function distance2D ([x1, y1], [x2, y2]) {
  const x = Math.pow(x1 - x2, 2)
  const y = Math.pow(y1 - y2, 2)
  return Math.sqrt(x + y)
}