'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardData } from '@/types/dashboard';
import { loadDashboardData } from '@/utils/dataTransform';
import { formatPercentage } from '@/utils/formatUtils';
import StatsOverview from '@/app/(dashboard)/components/StatsOverview';
import StatusDistributionChart from '@/components/StatusDistributionChart';
import StatusGuide from '@/components/StatusGuide';
import PageJsonLd from '@/components/PageJsonLd';
import Header from '@/components/Header';
import { STATUS_STYLES, RANK_ICONS, RANK_COLORS, type StatusKey } from '@/constants/dashboard';

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await loadDashboardData();
        setData(res);
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (error || !data)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error || '데이터를 불러올 수 없습니다.'}
      </div>
    );

  const o = data.overview;
  const normalRate = formatPercentage(o.overallNormalRate);

  return (
    <>
      <PageJsonLd page="home" />
      <div className="space-y-8 pt-28">
        {/* 헤더 */}
        <Header
          title="정부 사이트 현황 모니터링"
          description="정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 모니터링합니다. (10분마다 업데이트)"
          lastUpdated={data.lastUpdated}
        />

        {/* 전체 정상율 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">전체 서비스 정상율</h2>
              <p className="text-blue-100 mt-1">
                총 {o.totalServices.toLocaleString()}개 중 {o.normalServices.toLocaleString()}개 정상
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{normalRate}</div>
              <div className="flex items-center justify-end space-x-1 mt-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm text-blue-100">전체 평균</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상태별 통계 카드 */}
        <StatsOverview
          stats={{
            total: o.totalServices,
            normal: o.normalServices,
            maintenance: o.maintenanceServices,
            problem: o.problemServices,
            normalRate: o.overallNormalRate,
          }}
        />

        {/* 차트와 빠른 서비스 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 상태 분포 차트 */}
          <StatusDistributionChart
            stats={{
              total: o.totalServices,
              normal: o.normalServices,
              maintenance: o.maintenanceServices,
              problem: o.problemServices,
              normalRate: o.overallNormalRate,
            }}
            height="h-[25vh] sm:h-[30vh]"
          />

          {/* TOP3 빠른 서비스 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">가장 빠른 서비스 TOP3</h3>
            {o.top3FastestServices.length > 0 ? (
              o.top3FastestServices.map((s, i) => {
                const style = STATUS_STYLES[s.status as StatusKey];
                return(
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{RANK_ICONS[i] ?? '🏅'}</span>
                      <div>
                        <span className="font-medium text-gray-900">{s.name}</span>
                        <div className={`${style.color} text-sm`}>
                          {style.text}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${RANK_COLORS[i] ?? 'text-gray-500'}`}>
                      <div className="text-2xl font-bold">{s.responseTime}ms</div>
                      <div className="text-sm text-gray-500">응답시간</div>
                    </div>
                  </div>
              )})
            ) : (
              <div className="text-center text-gray-500 py-6">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                빠른 서비스 데이터가 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 상태 기준 안내 */}
        <StatusGuide />
      </div>
    </>
  );
}
