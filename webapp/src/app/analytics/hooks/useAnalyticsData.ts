import { useState, useEffect } from 'react';
import {
  loadDashboardData,
  loadServiceData,
  loadHistoryData,
  loadAgencyHistoryData,
} from '@/utils/dataTransform';
import { HistoryData, OverviewData } from '@/types/analytics';
import { DashboardData } from '@/types/dashboard';
import { Service } from '@/types/service';

export function useAnalyticsData() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [agencyHistoryData, setAgencyHistoryData] = useState<
    Array<{
      agencyId: string;
      history: Array<{
        timestamp: string;
        normalRate: number;
        stats: { total: number; normal: number; maintenance: number; problem: number };
      }>;
    }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [dashboardData, servicesData, historyData, agencyHistoryData]: [
          DashboardData,
          Service[],
          HistoryData[],
          Array<{
            agencyId: string;
            history: Array<{
              timestamp: string;
              normalRate: number;
              stats: { total: number; normal: number; maintenance: number; problem: number };
            }>;
          }>,
        ] = await Promise.all([
          loadDashboardData(),
          loadServiceData(),
          loadHistoryData(),
          loadAgencyHistoryData(),
        ]);

        setOverview({
          ...dashboardData.overview,
          bestAgency: dashboardData.overview.bestAgencies?.[0] || null,
          fastestAgency: dashboardData.overview.top3FastestServices?.[0] || null,
        });

        setServices(servicesData);
        setHistoryData(historyData);
        setAgencyHistoryData(agencyHistoryData);
        setLastUpdated(dashboardData.lastUpdated || new Date().toLocaleString('ko-KR'));
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!overview) {
    return {
      overview: null,
      isLoading,
      error,
      lastUpdated,
      statusData: [],
      totalServices: 0,
      hourlyData: [],
      agencyStats: [],
      bestAgenciesCount: 0,
    };
  }

  const bestAgencyRate = overview.bestAgency?.rate || 0;

  // 각 기관별 서비스 정상율 계산
  const agencyRates = new Map<string, { total: number; normal: number }>();
  services.forEach((service) => {
    const agencyId = service.id;
    if (!agencyRates.has(agencyId)) {
      agencyRates.set(agencyId, { total: 0, normal: 0 });
    }
    const stats = agencyRates.get(agencyId)!;
    stats.total += 1;
    if (service.status === 'normal') stats.normal += 1;
  });

  const bestAgenciesCount = Array.from(agencyRates.entries()).filter(([, stats]) => {
    const normalRate = stats.total > 0 ? (stats.normal / stats.total) * 100 : 0;
    return Math.abs(normalRate - bestAgencyRate) < 0.01;
  }).length;

  // 서비스 상태 비율 (원형차트용)
  const statusData = [
    { name: '정상', value: overview.normalServices, color: '#10B981' },
    { name: '점검중', value: overview.maintenanceServices, color: '#3B82F6' },
    { name: '문제', value: overview.problemServices, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  // 최근 6시간 트렌드 데이터 (빈 시간은 0)
  const now = new Date();
  const hoursRange = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getTime() - (5 - i) * 60 * 60 * 1000);
    return {
      hour: `${d.getHours()}시`,
      date: `${d.getMonth() + 1}/${d.getDate()}`,
    };
  });
  const hourlyDataMap = new Map<string, number>();
  historyData.forEach((h) => {
    const date = new Date(h.timestamp);
    const hourLabel = `${date.getHours()}시`;
    const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
    const normalRate = h.overall.total > 0 ? (h.overall.normal / h.overall.total) * 100 : 0;
    hourlyDataMap.set(`${dateLabel}-${hourLabel}`, Number(normalRate.toFixed(2)));
  });
  const hourlyData = hoursRange.map((item) => ({
    ...item,
    normalRate: hourlyDataMap.get(`${item.date}-${item.hour}`) ?? 0,
  }));

  const totalServices = overview.totalServices;

  // 기관별 통계 (services 기반 매핑)
  const agencyStats = agencyHistoryData.map((record) => {
    const agency = services.find((s) => s.id === record.agencyId);

    const today = record.history.find((h) => h.timestamp === 'today');
    const yesterday = record.history.find((h) => h.timestamp === 'yesterday');
    const week = record.history.find((h) => h.timestamp === 'week');
    const month = record.history.find((h) => h.timestamp === 'month');

    return {
      agencyId: record.agencyId,
      agency: agency?.name ?? '(알 수 없음)',
      url: agency?.url ?? '#',
      current: {
        normalRate: today?.normalRate ?? 0,
        maintenanceRate: today?.stats?.maintenance ?? 0,
        problemRate: today?.stats?.problem ?? 0,
      },
      day1: { normalRate: yesterday?.normalRate ?? null },
      week1: { normalRate: week?.normalRate ?? null },
      month1: { normalRate: month?.normalRate ?? null },
      trend: 0,
    };
  });

  return {
    overview,
    isLoading,
    error,
    lastUpdated,
    statusData,
    totalServices,
    hourlyData,
    agencyStats,
    bestAgenciesCount,
  };
}
