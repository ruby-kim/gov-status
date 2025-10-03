import { TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { formatPercentage, formatAgencyWithRate } from '@/utils/formatUtils';

interface Overview {
  overallNormalRate: number;
  totalServices: number;
  normalServices: number;
  bestAgency: {
    name: string;
    rate: number;
  } | null;
  warningAgencies: number;
  avgResponseTime: number;
  fastestAgency: {
    name: string;
    responseTime: number;
  } | null;
}

interface AnalyticsOverviewProps {
  overview: Overview;
  bestAgenciesCount: number;
}

export default function AnalyticsOverview({ overview, bestAgenciesCount }: AnalyticsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
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
                총 {overview.totalServices.toLocaleString()}개 중 {overview.normalServices.toLocaleString()}개 정상
              </dd>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500">최고 정상율 기관</dt>
              <dd className="text-lg lg:text-xl font-bold text-gray-900">
                {overview.bestAgency ? 
                  formatAgencyWithRate(overview.bestAgency.name, overview.bestAgency.rate) : 'N/A'}
              </dd>
              {bestAgenciesCount > 1 && (
                <dd className="text-xs text-gray-500 mt-1">
                  외 {bestAgenciesCount - 1}개
                </dd>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500">주의 필요 기관</dt>
              <dd className="text-xl lg:text-2xl font-bold text-gray-900">{overview.warningAgencies}개</dd>
              <dd className="text-xs text-gray-500 mt-1">
                총 {overview.totalServices.toLocaleString()}개 중 {overview.warningAgencies.toLocaleString()}개 주의 필요
              </dd>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500">평균 응답시간</dt>
              <dd className="text-xl lg:text-2xl font-bold text-gray-900">{overview.avgResponseTime}ms</dd>
              <dd className="text-xs text-gray-500 mt-1">
                {overview.fastestAgency ? `가장 빠른 기관: ${overview.fastestAgency.name} (${overview.fastestAgency.responseTime}ms)` : 'N/A'}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
