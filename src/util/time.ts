import { clamp } from './numbers';
import * as ease from 'd3-ease';

export default class Timer {
  public duration;
  public method;
  public ease: any;
  public easing: any;
  public start: DOMHighResTimeStamp;
  public complete: boolean;
  public $finished: Promise<unknown>;
  private __resolve__: Function;
  private __reject__: Function;

  constructor(duration: number, method: Function, easing = 'easeLinear') {
    this.ease = ease;
    this.duration = duration;
    this.method = method;
    this.easing = easing;
    this.start = window.performance.now();
    this.complete = false;
    this.__reject__ = () => {};
    this.__resolve__ = () => {};
    this.$finished = new Promise((resolve, reject) => {
      this.__resolve__ = resolve;
      this.__reject__ = reject;
    });
  }

  tick(now: DOMHighResTimeStamp) {
    if (this.complete) return;
    const elapsed = now - this.start;
    const linear: number = clamp(elapsed / this.duration);
    const progress: number = this.ease[this.easing](linear);
    this.method({ progress, stop: this.stop.bind(this) });
    if (progress === 1) this.stop();
  }

  stop() {
    this.complete = true;
    this.__resolve__();
  }

  cancel() {
    this.complete = true;
    this.__reject__();
  }
}

let _instances: any = [];
let _running: boolean = false;

function _tick(now: DOMHighResTimeStamp) {
  _instances.forEach((instance: Timer) => instance.tick(now));
  _instances = _instances.filter(
    (instance: Timer) => instance.complete === false
  );

  if (_instances.length) {
    requestAnimationFrame(_tick);
  } else {
    _running = false;
  }
}

export function timer(
  duration: number,
  method: Function,
  easing = 'easeCubicOut'
) {
  if (!_running) {
    requestAnimationFrame(_tick);
    _running = true;
  }

  const instance = new Timer(duration, method, easing);
  _instances.push(instance);
  return instance;
}

export function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
