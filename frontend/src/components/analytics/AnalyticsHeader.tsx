import { Activity } from 'lucide-react';

interface AnalyticsHeaderProps {
  lastUpdated: string;
}

export default function AnalyticsHeader({ lastUpdated }: AnalyticsHeaderProps) {
  return (
    <>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">서비스 분석</h1>
          <p className="mt-2 text-gray-600">정부 서비스들의 상세 통계 및 1개월 트렌드 분석</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>마지막 업데이트: {lastUpdated || '로딩 중...'}</span>
          </div>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="mb-2">
        <p className="text-sm text-gray-500">※ 최신 수집 데이터 기준</p>
      </div>
    </>
  );
}
