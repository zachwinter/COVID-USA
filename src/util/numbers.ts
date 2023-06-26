import { scaleLinear } from 'd3-scale';

export function clamp(val: number, min = 0, max = 1) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

export function randomNumber(min = 0, max = 1, round = false) {
  const num = scaleLinear([0, 1], [min, max])(Math.random());
  if (round) return Math.round(num);
  return num;
}
