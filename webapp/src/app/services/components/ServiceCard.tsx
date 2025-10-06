'use client';

import { Service } from '@/types/service';
import { STATUS_CONFIG, type StatusKey } from '@/constants/config';
import { clsx } from 'clsx';
import { ExternalLink, Clock } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  viewMode?: 'grid' | 'list';
}

export default function ServiceCard({ service, viewMode = 'grid' }: ServiceCardProps) {
  const config = STATUS_CONFIG[service.status as StatusKey];
  const Icon = config.icon;

  // 최근 점검 시간 포맷
  const formatLastChecked = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  // grid와 list 모드 각각의 스타일 분기
  if (viewMode === 'list') {
    return (
      <div
        className={clsx(
          'rounded-lg border-2 transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2',
          config.bg,
          config.border,
          'flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-6 py-4 px-6'
        )}
      >
        {/* 왼쪽: 제목 */}
        <div className="flex items-center space-x-3 min-w-[200px]">
          <Icon className={clsx('w-6 h-6 flex-shrink-0', config.iconColor)} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{service.name}</h3>
            <span
              className={clsx(
                'inline-flex px-2 py-0.5 mt-1 text-xs font-semibold rounded-full whitespace-nowrap',
                config.text,
                config.bg
              )}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* 가운데: 시간 / 응답 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-x-6 text-sm text-gray-600 mt-4 sm:mt-0 flex-1">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formatLastChecked(service.lastChecked)}</span>
          </div>

          {service.responseTime != null && (
            <div className="flex items-center space-x-1">
              <span>응답시간:</span>
              <span
                className={clsx(
                  'font-medium',
                  service.responseTime > 5000
                    ? 'text-red-600'
                    : service.responseTime > 1000
                      ? 'text-yellow-600'
                      : 'text-gray-800'
                )}
              >
                {service.responseTime}ms
              </span>
            </div>
          )}
        </div>

        {/* 오른쪽: 링크 / 태그 */}
        <div className="flex flex-col sm:items-end mt-4 sm:mt-0 space-y-2">
          {service.url && (
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <span>사이트 방문</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {service.tags?.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {service.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 그리드 모드
  if (viewMode === 'grid') {
    return (
      <div
        className={clsx(
          'relative rounded-lg border-2 p-6 transition-all hover:shadow-md cursor-pointer focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2',
          config.bg,
          config.border,
          'flex flex-col justify-between h-full overflow-hidden'
        )}
        tabIndex={0}
      >
        {/* 모바일 전용: 오른쪽 상단 링크 */}
        {service.url && (
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-7 right-4 flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs font-medium break-all md:hidden"
          >
            <span>사이트 방문</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* 상단: 이름 + 상태 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon className={clsx('w-6 h-6', config.iconColor)} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">
                {service.name}
              </h3>
              <p className={clsx('text-sm font-medium', config.text)}>{config.label}</p>
            </div>
          </div>
        </div>

        {/* 가운데: 시간, 응답 */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-auto flex-wrap gap-y-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatLastChecked(service.lastChecked)}</span>
            </div>
            {service.responseTime != null && (
              <div className="flex items-center space-x-1">
                <span>응답시간:</span>
                <span
                  className={clsx(
                    'font-medium',
                    service.responseTime > 5000
                      ? 'text-red-600'
                      : service.responseTime > 1000
                        ? 'text-yellow-600'
                        : 'text-gray-800'
                  )}
                >
                  {service.responseTime}ms
                </span>
              </div>
            )}
          </div>

          {/* 데스크탑 전용: 하단 오른쪽 링크 */}
          {service.url && (
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium break-all"
            >
              <span>사이트 방문</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* 태그 */}
        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {service.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md break-words"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
}
