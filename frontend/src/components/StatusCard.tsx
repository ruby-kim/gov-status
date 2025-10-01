'use client';

import { ServiceStatus } from '@/types';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, Wrench } from 'lucide-react';
import { formatPercentage } from '@/utils/formatUtils';

interface StatusCardProps {
  status: ServiceStatus;
  count: number;
  total: number;
  percentage: number;
}

const statusConfig = {
  normal: {
    label: '정상',
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  maintenance: {
    label: '점검중',
    icon: Wrench,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  problem: {
    label: '문제',
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200'
  }
};

export default function StatusCard({ status, count, total, percentage }: StatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={clsx(
      'rounded-lg border-2 p-6 transition-all hover:shadow-md',
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className={clsx('w-8 h-8', config.iconColor)} />
          <div>
            <p className={clsx('text-sm font-medium', config.textColor)}>
              {config.label}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {(count || 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={clsx('text-2xl font-bold', config.textColor)}>
            {formatPercentage(percentage || 0)}
          </p>
          <p className="text-sm text-gray-500">
            전체 {(total || 0).toLocaleString()}개 중
          </p>
        </div>
      </div>
    </div>
  );
}
