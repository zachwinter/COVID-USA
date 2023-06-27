import { type BaseProps, DefaultProps } from './D3';

export interface BarChartProps extends BaseProps {
  lineWidth?: number;
  lineCap?: string;
  lineJoin?: string;
  barColor?: string;
  lineColor?: string;
  fluid?: boolean;
}

export const BaseBarChartProps: BarChartProps = {
  ...DefaultProps,
  lineWidth: 1,
  lineCap: 'round',
  lineJoin: 'round',
  barColor: '#E80040',
  lineColor: '#E80040',
  fluid: false,
};
