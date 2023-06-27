import { type Datum } from './Datum';
import { zoomIdentity } from 'd3-zoom';
import { type ScaleLinear, type ScaleTime } from 'd3-scale';

export type BaseProps = {
  width: number;
  height: number;
  dpr?: number;
  padding?: number;
  dataset?: Readonly<Datum | any[]>;
  zoomX?: boolean;
  zoomY?: boolean;
  domainY?: [Date, Date] | [number, number] | null;
  domainX?: [Date, Date] | [number, number] | null;
  transform?: typeof zoomIdentity;
  onTick?: Function;
};

export type BasePropRefs = {
  width: Ref<number>;
  height: Ref<number>;
  dpr: Ref<number>;
  padding: Ref<number>;
  dataset: Ref<Readonly<Datum | any[]>>;
  zoomX: Ref<boolean>;
  zoomY: Ref<boolean>;
  domainY: Ref<[Date, Date] | [number, number] | null>;
  domainX: Ref<[Date, Date] | [number, number] | null>;
  transform: Ref<typeof zoomIdentity>;
  onTick: Function;
};

export type PropKey = keyof BaseProps;

export const DefaultProps: BaseProps = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: window.devicePixelRatio,
  padding: 40,
  dataset: [],
  zoomX: true,
  zoomY: false,
  domainY: null,
  domainX: null,
  transform: zoomIdentity,
  onTick: () => {},
};

export type AxisDataType = 'date' | 'number';

export type ScaleArray = [
  ScaleLinear<any, any, any> | null,
  ScaleTime<any, any, any> | null
];

export type ScaleRecord = Record<'x' | 'y', any>;
