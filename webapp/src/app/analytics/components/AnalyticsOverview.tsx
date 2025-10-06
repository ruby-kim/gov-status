import { TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { formatPercentage, formatAgencyWithRate } from '@/utils/formatUtils';
import { AnalyticsOverviewProps } from '@/types/analytics';

export default function AnalyticsOverview({ overview, bestAgenciesCount }: AnalyticsOverviewProps) {
  const bestAgency = overview.bestAgency;
  const fastestAgency = overview.fastestAgency;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
      {/* 전체 정상율 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500">전체 정상율</dt>
              <dd className="text-xl lg:text-2xl font-bold text-gray-900">
                {formatPercentage(overview.overallNormalRate)}
              </dd>
              <dd className="text-xs text-gray-500 mt-1">
                총{' '}
                <span className="font-medium text-gray-700">
                  {overview.totalServices.toLocaleString()}
                </span>
                개 중{' '}
                <span className="font-medium text-green-700">
                  {overview.normalServices.toLocaleString()}
                </span>
                개 정상
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* 최고 정상율 기관 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500">최고 정상율 기관</dt>
              <dd className="text-lg lg:text-xl font-bold text-gray-900">
                {bestAgency ? formatAgencyWithRate(bestAgency.name, bestAgency.rate) : 'N/A'}
              </dd>
              {bestAgenciesCount > 1 && (
                <dd className="text-xs text-gray-500 mt-1">외 {bestAgenciesCount - 1}개</dd>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 주의 필요 기관 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500">주의 필요 기관</dt>
              <dd className="text-xl lg:text-2xl font-bold text-gray-900">
                {overview.warningAgencies}개
              </dd>
              <dd className="text-xs text-gray-500 mt-1">
                점검중{' '}
                <span className="font-medium text-blue-600">
                  {overview.maintenanceServices.toLocaleString()}
                </span>
                개 / 문제{' '}
                <span className="font-medium text-red-600">
                  {overview.problemServices.toLocaleString()}
                </span>
                개
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* 평균 응답시간 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500">평균 응답시간</dt>
              <dd className="text-xl lg:text-2xl font-bold text-gray-900">
                {overview.avgResponseTime ? `${overview.avgResponseTime}ms` : 'N/A'}
              </dd>
              <dd
                className="text-xs text-gray-500 mt-1 leading-snug whitespace-pre-line break-words"
                style={{ wordBreak: 'keep-all' }}
              >
                {fastestAgency ? (
                  <>
                    {fastestAgency.name.length >= 4 ? (
                      <>
                        가장 빠른 기관:{'\n'}
                        {`${fastestAgency.name} (${fastestAgency.responseTime}ms)`}
                      </>
                    ) : (
                      <>
                        {`가장 빠른 기관: ${fastestAgency.name} (${fastestAgency.responseTime}ms)${
                          Array.isArray(overview.fastestAgency) && overview.fastestAgency.length > 1
                            ? ` 외 ${overview.fastestAgency.length - 1}개`
                            : ''
                        }`}
                      </>
                    )}
                  </>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
