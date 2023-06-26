import { createCanvas } from '../util/canvas';

export interface SpriteOptions {
  width: number;
  height: number;
  paint: Function;
}

export type Artboard = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
};

export default class Sprite {
  public canvas: HTMLCanvasElement;

  constructor({ width, height, paint }: SpriteOptions) {
    const { canvas, ctx } = createCanvas({ width, height });
    this.canvas = canvas;
    paint({ ctx, width, height, canvas } as Artboard);
  }

  applyTo(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.drawImage(this.canvas, x - width / 2, y - height / 2, width, height);
  }

  destroy() {
    this.canvas.remove();
  }
}
