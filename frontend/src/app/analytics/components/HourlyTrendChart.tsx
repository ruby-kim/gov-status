import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface HourlyData {
  hour: string;
  date: string;
  normalRate: number;
}

interface HourlyTrendChartProps {
  hourlyData: HourlyData[];
}

export default function HourlyTrendChart({ hourlyData }: HourlyTrendChartProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">시간대별 서비스 정상율 트렌드</h3>
      <div className="h-[30vh] sm:h-[35vh] md:h-[35vh] lg:h-[45vh] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              angle={-30} 
              textAnchor="end" 
              fontSize={10}
              tickFormatter={(value, index) => {
                const data = hourlyData[index];
                return data?.date ? `${data.date}\n${value}` : value;
              }}
            />
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
  );
}
