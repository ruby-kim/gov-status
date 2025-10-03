'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ServiceStats } from '@/types/service';
import { formatPercentage } from '@/utils/formatUtils';

interface StatusDistributionChartProps {
  stats: ServiceStats;
}

const COLORS = {
  normal: '#10B981',    // green-500
  maintenance: '#3B82F6', // blue-500
  problem: '#EF4444'    // red-500
};


export default function StatusDistributionChart({ stats }: StatusDistributionChartProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const data = [
    { name: '정상', value: stats.normal, color: COLORS.normal },
    { name: '점검중', value: stats.maintenance, color: COLORS.maintenance },
    { name: '문제', value: stats.problem, color: COLORS.problem }
  ].filter(item => item.value > 0);

  // 반응형 차트 설정
  const chartConfig = {
    mobile: {
      innerRadius: 30,
      outerRadius: 60,
      legendHeight: 30,
      legendFontSize: '10px'
    },
    tablet: {
      innerRadius: 50,
      outerRadius: 90,
      legendHeight: 36,
      legendFontSize: '11px'
    },
    desktop: {
      innerRadius: 60,
      outerRadius: 120,
      legendHeight: 36,
      legendFontSize: '12px'
    }
  };

  const config = chartConfig[screenSize];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0] as { name: string; value: number };
      const percentage = formatPercentage((data.value / stats.total) * 100);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 상태 분포</h3>
      <div className="h-[30vh] sm:h-[35vh] md:h-[45vh] lg:h-[50vh] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
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
              height={config.legendHeight}
              formatter={(value, entry) => (
                <span style={{ 
                  color: entry?.color, 
                  fontSize: config.legendFontSize
                }}>
                  {value} ({formatPercentage((entry?.payload?.value || 0) / stats.total * 100)})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
