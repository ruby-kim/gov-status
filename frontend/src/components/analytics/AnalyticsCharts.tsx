import StatusDistributionChart from '../StatusDistributionChart';
import HourlyTrendChart from './HourlyTrendChart';

interface StatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface HourlyData {
  hour: string;
  date: string;
  normalRate: number;
}

interface AnalyticsChartsProps {
  statusData: StatusData[];
  totalServices: number;
  hourlyData: HourlyData[];
}

export default function AnalyticsCharts({ statusData, totalServices, hourlyData }: AnalyticsChartsProps) {
  const normalCount = statusData.find(item => item.name === '정상')?.value || 0;
  const stats = {
    total: totalServices,
    normal: normalCount,
    maintenance: statusData.find(item => item.name === '점검중')?.value || 0,
    problem: statusData.find(item => item.name === '문제')?.value || 0,
    normalRate: totalServices > 0 ? (normalCount / totalServices) * 100 : 0
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatusDistributionChart stats={stats} height="h-[30vh] sm:h-[35vh] md:h-[35vh] lg:h-[45vh]" />
      <HourlyTrendChart hourlyData={hourlyData} />
    </div>
  );
}
