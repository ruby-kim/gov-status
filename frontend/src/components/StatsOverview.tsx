'use client';

import { ServiceStats } from '@/types/service';
import StatusCard from './StatusCard';

interface StatsOverviewProps {
  stats: ServiceStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statusData = [
    {
      status: 'normal' as const,
      count: stats.normal,
      total: stats.total,
      percentage: (stats.normal / stats.total) * 100
    },
    {
      status: 'maintenance' as const,
      count: stats.maintenance,
      total: stats.total,
      percentage: (stats.maintenance / stats.total) * 100
    },
    {
      status: 'problem' as const,
      count: stats.problem,
      total: stats.total,
      percentage: (stats.problem / stats.total) * 100
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statusData.map((data) => (
        <StatusCard
          key={data.status}
          status={data.status}
          count={data.count}
          total={data.total}
          percentage={data.percentage}
        />
      ))}
    </div>
  );
}
