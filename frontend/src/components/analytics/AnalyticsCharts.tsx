import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { formatPercentage } from '@/utils/formatUtils';

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
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0] as { name: string; value: number };
      const percentage = formatPercentage((data.value / totalServices) * 100);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toLocaleString()}개 ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 서비스 상태 분포 */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 상태 분포</h3>
        <div className="h-[30vh] sm:h-[35vh] md:h-[35vh] lg:h-[45vh] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry?.color, fontSize: '12px' }}>
                    {value} ({formatPercentage((entry?.payload?.value || 0) / totalServices * 100)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시간대별 트렌드 */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시간대별 서비스 정상율 트렌드</h3>
        <div className="h-[30vh] sm:h-[35vh] md:h-[35vh] lg:h-[45vh] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" angle={-30} textAnchor="end" fontSize={10}/>
              <YAxis fontSize={10} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [
                  `${value}%`, 
                  '정상율'
                ]}
                labelFormatter={(label: string, payload: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return `${data.date ? data.date + ' ' : ''}${label}`;
                  }
                  return label;
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line dataKey="normalRate" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
