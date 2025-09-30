'use client';

import { Service } from '@/types/service';
import { clsx } from 'clsx';
import { CheckCircle, AlertTriangle, XCircle, Wrench, ExternalLink, Clock } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
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

export default function ServiceCard({ service }: ServiceCardProps) {
  const config = statusConfig[service.status];
  const Icon = config.icon;

  const formatLastChecked = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  return (
    <div className={clsx(
      'rounded-lg border-2 p-6 transition-all hover:shadow-md cursor-pointer',
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={clsx('w-6 h-6', config.iconColor)} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.agency.name}</p>
          </div>
        </div>
        <span className={clsx(
          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
          config.textColor,
          config.bgColor
        )}>
          {config.label}
        </span>
      </div>

      {service.description && (
        <p className="text-sm text-gray-600 mb-4">{service.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatLastChecked(service.lastChecked)}</span>
          </div>
          {service.responseTime && (
            <div className="flex items-center space-x-1">
              <span>응답시간: {service.responseTime}ms</span>
            </div>
          )}
        </div>
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <span>사이트 방문</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {service.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
