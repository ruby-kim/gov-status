export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartData extends ChartData {
  color: string;
}

export interface BarChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface LineChartData {
  hour: string;
  value: number;
  date?: string;
}

export interface TooltipProps {
  value: number;
  name: string;
  payload?: Array<{ payload: { date?: string } }>;
}

export interface PieLabelProps {
  name: string;
  value: number;
  percent?: number;
}
