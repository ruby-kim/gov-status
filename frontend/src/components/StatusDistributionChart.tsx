'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ServiceStats } from '@/types/service';

interface StatusDistributionChartProps {
  stats: ServiceStats;
}

const COLORS = {
  normal: '#10B981',    // green-500
  maintenance: '#3B82F6', // blue-500
  problem: '#EF4444'    // red-500
};


export default function StatusDistributionChart({ stats }: StatusDistributionChartProps) {
  const data = [
    { name: '정상', value: stats.normal, color: COLORS.normal },
    { name: '점검중', value: stats.maintenance, color: COLORS.maintenance },
    { name: '문제', value: stats.problem, color: COLORS.problem }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0] as { name: string; value: number };
      const percentage = ((data.value / stats.total) * 100).toFixed(1);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 상태 분포</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry?.color }}>
                  {value} ({((entry?.payload?.value || 0) / stats.total * 100).toFixed(1)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
