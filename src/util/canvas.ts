import { createElement } from './dom';

export const PI: number = Math.PI;
export const TWO_PI: number = PI * 2;
export const PI_OVER_180: number = PI / 180;

export interface CanvasOptions {
  width?: number;
  height?: number;
  dpr?: number;
  target?: HTMLElement | null;
  alpha?: boolean;
}

const DEFAULT_CANVAS_OPTIONS = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: window.devicePixelRatio,
  target: null,
  alpha: true,
};

export function createCanvas(options: CanvasOptions = DEFAULT_CANVAS_OPTIONS): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const { width, height, dpr, target, alpha } = {
    ...DEFAULT_CANVAS_OPTIONS,
    ...options,
  };

  const canvas: any = createElement('canvas', target);
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d', { alpha })!;
  ctx.imageSmoothingQuality = 'high';
  sizeCtx({ ctx, width, height, dpr });
  return { canvas, ctx };
}

export interface SizeOptions {
  ctx: CanvasRenderingContext2D;
  width?: number;
  height?: number;
  dpr?: number;
}

export function sizeCtx({
  ctx,
  width = window.innerWidth,
  height = window.innerHeight,
  dpr = window.devicePixelRatio,
}: SizeOptions): void {
  ctx.canvas.width = width * dpr;
  ctx.canvas.height = height * dpr;
  ctx.canvas.style.width = width + 'px';
  ctx.canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);
}

export function toRadians(angle: number): number {
  return angle * PI_OVER_180;
}

export interface Coords {
  x: number;
  y: number;
}

export function coords(radius: number, theta: number, cx = 0, cy = 0): Coords {
  return {
    x: radius * Math.cos(toRadians(theta)) + cx,
    y: radius * Math.sin(toRadians(theta)) + cy,
  };
}

export function polygon(
  sides: number,
  radius: number,
  cx = 0,
  cy = 0,
  rotation = 0
): Coords[] {
  const angle: number = 360 / sides;
  const vertices: Coords[] = [];

  for (let i = 0; i < sides; i++) {
    const _coords: Coords = coords(radius, angle * i + rotation, cx, cy);
    vertices.push(_coords);
  }

  return vertices;
}

export function distance2D([x1, y1]: number[], [x2, y2]: number[]): number {
  const x: number = Math.pow(x1 - x2, 2);
  const y: number = Math.pow(y1 - y2, 2);
  return Math.sqrt(x + y);
}

export interface SpriteOptions {
  width: number;
  height: number;
  paint: () => void;
}

export class Sprite {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor({ width, height, paint }: SpriteOptions) {
    const { canvas, ctx } = createCanvas({ width, height });
    this.width = width;
    this.height = height;
    this.canvas = canvas;
    this.ctx = ctx;
    paint.call(this);
  }
}
