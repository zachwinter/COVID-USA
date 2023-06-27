import { scaleLinear, scaleTime } from 'd3-scale';
import { min, max } from 'd3-array';
import {
  type BaseProps,
  type BarChartProps,
  type ScaleRecord,
  type AxisDataType,
} from '../types';

export function buildScales(props: BaseProps & BarChartProps): ScaleRecord {
  let domainX = props.domainX;
  let domainY = props.domainY;

  if (domainX === null) {
    if (props.dataset?.[0][0] instanceof Date) {
      domainX = [
        props.dataset?.[0][0],
        props.dataset?.[props.dataset?.length - 1][0],
      ];
    } else {
      domainX = [
        min(props.dataset?.map(v => v[0]) || [0]),
        max(props.dataset?.map(v => v[0]) || [0]),
      ];
    }
  }

  if (domainY === null) {
    if (props.dataset?.[0][1] instanceof Date) {
      domainY = [
        props.dataset?.[0][1],
        props.dataset?.[props.dataset?.length - 1][1],
      ];
    } else {
      domainY = [
        max((props.dataset as any[])?.map?.((v: any) => v?.[1])),
        min((props.dataset as any[])?.map?.((v: any) => v?.[1])),
      ];
    }
  }

  const lineWidth = props.lineWidth || 0;
  const xType = domainX?.[0] instanceof Date ? 'date' : 'number';
  const yType = domainY?.[0] instanceof Date ? 'date' : 'number';
  const xAxisDataType: AxisDataType = xType;
  const yAxisDataType: AxisDataType = yType;
  const xMethod = (xAxisDataType === 'date' ? scaleTime : scaleLinear) as any;
  const xScale = xMethod(domainX, [lineWidth, props.width - (props.padding || 0)]);
  const yMethod = (yAxisDataType === 'date' ? scaleTime : scaleLinear) as any;
  const yScale = yMethod(domainY, [
    lineWidth,
    props.height - (props.padding || 0),
  ]);
  return { x: xScale, y: yScale };
}
