import { createCanvas } from '../util/canvas'

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