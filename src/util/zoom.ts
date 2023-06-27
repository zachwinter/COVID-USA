// @ts-nocheck

import { zoom, zoomTransform, ZoomBehavior } from 'd3-zoom';
import { select, pointer } from 'd3-selection';
import { type ScaleRecord } from '../types/D3';

type ZoomOptions = {
  setTransform: Function;
  zoomInstance: Ref<ZoomBehavior<Element, unknown> | null>;
  element: HTMLElement;
  scales: Ref<ScaleRecord>;
  tweening: Ref<boolean>;
};

export function initZoom({
  setTransform,
  zoomInstance,
  element,
  scales,
  tweening,
}: ZoomOptions) {
  zoomInstance.value = zoom().scaleExtent([0.2, 20]) as any;
  zoomInstance.value?.touchable();

  let raf = 0;

  function onZoom(e: any) {
    const self: any = this as any;
    cancelAnimationFrame(raf);
    if (tweening.value) return;
    raf = requestAnimationFrame(zoomed.bind(self, e));
  }

  zoomInstance.value?.on('zoom', onZoom);

  const $element = select(element)
    .on('wheel', (e: WheelEvent) => e.preventDefault())
    .call(zoomInstance.value as any) as any;

  function zoomed(event: any) {
    const self: any = this as any;

    if (
      tweening.value ||
      !zoomInstance.value ||
      !event?.sourceEvent ||
      !(event?.sourceEvent instanceof WheelEvent)
    )
      return event.sourceEvent && setTransform(event.transform);

    const { transform: t, sourceEvent } = event;
    const dx = Math.abs(sourceEvent.deltaX);
    const dy = Math.abs(sourceEvent.deltaY);

    if (dx > dy) {
      zoomInstance.value?.translateBy(
        $element,
        -sourceEvent.deltaX / 3 / t.k,
        0
      );
      setTransform(zoomTransform(self));
      return sourceEvent.preventDefault();
    }

    if (dx < dy) {
      const delta = -sourceEvent.deltaY * (sourceEvent.deltaMode ? 120 : 1);
      const k = t.k * Math.pow(2, delta / 500);
      zoomInstance.value.scaleTo($element, k);
      const t2 = zoomTransform(self); // reaccess the transform so that the zoom's extents apply
      const p = pointer(event, event.sourceEvent.target); // We're going to shift by a point
      const w = scales.value.x.range()[1]; // My scales reference
      const dw = w / t2.k - w / t.k; // The change in width
      const x = dw / 2 - dw * (p[0] / w);
      zoomInstance.value.translateBy($element, -x, 0);
      setTransform(zoomTransform(self));
      return sourceEvent.preventDefault();
    }
  }

  return () => {
    $element.on('wheel', null);
    zoomInstance.value?.on('zoom', null);
    zoomInstance.value = null;
  };
}
