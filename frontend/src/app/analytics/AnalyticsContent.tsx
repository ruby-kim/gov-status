'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import PageJsonLd from '@/components/PageJsonLd';
import Header from '@/components/Header';
import AnalyticsTable from '@/app/analytics/components/AnalyticsTable';
import AnalyticsOverview from '@/app/analytics/components/AnalyticsOverview';
import AnalyticsCharts from '@/app/analytics/components/AnalyticsCharts';
import { useAnalyticsData } from './hooks/useAnalyticsData';

export default function AnalyticsContent() {
  const {
    overview,
    isLoading,
    error,
    lastUpdated,
    statusData,
    totalServices,
    hourlyData,
    agencyStats,
    bestAgenciesCount
  } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <>
      <PageJsonLd page="analytics" />
      <div className="space-y-6 pt-28">
        <Header
          title="서비스 통계"
          description="정부 서비스들의 상세 통계 및 1개월 트렌드를 분석합니다. (10분마다 업데이트)"
          lastUpdated={lastUpdated}
        />
        <AnalyticsOverview overview={overview} bestAgenciesCount={bestAgenciesCount} />
        <AnalyticsCharts statusData={statusData} totalServices={totalServices} hourlyData={hourlyData} />
        <AnalyticsTable agencyStats={agencyStats} />
      </div>
    </>
  );
}