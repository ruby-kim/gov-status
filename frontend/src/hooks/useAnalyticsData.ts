import { useState, useEffect } from 'react';
import { loadDashboardData, loadBackendData, loadHistoryData, loadAgencyHistoryData } from '@/utils/dataTransform';
import { HistoryData } from '@/types/api/dashboard';

export function useAnalyticsData() {
  const [overview, setOverview] = useState<{
    totalServices: number;
    normalServices: number;
    maintenanceServices: number;
    problemServices: number;
    overallNormalRate: number;
    bestAgency: { name: string; rate: number } | null;
    warningAgencies: number;
    avgResponseTime: number;
    fastestAgency: { name: string; responseTime: number } | null;
  } | null>(null);

  const [agencies, setAgencies] = useState<{
    agencyId: string;
    name: string;
    url: string;
    mainCategory: string;
    subCategory: string;
    tags: string[];
  }[]>([]);

  const [services, setServices] = useState<{
    id: string;
    name: string;
    url: string;
    status: 'normal' | 'maintenance' | 'problem';
    responseTime?: number;
    lastChecked?: Date;
    agency: {
      id: string;
      name: string;
      url?: string;
      mainCategory?: string;
      subCategory?: string;
      tags?: string[];
    };
  }[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [historyData, setHistoryData] = useState<HistoryData[]>([]);

  const [agencyHistoryData, setAgencyHistoryData] = useState<Array<{
    agencyId: string;
    history: Array<{
      timestamp: string;
      normalRate: number;
      stats: { total: number; normal: number; maintenance: number; problem: number };
    }>;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [dashboardData, servicesData, historyData, agencyHistoryData] = await Promise.all([
          loadDashboardData(),
          loadBackendData(),
          loadHistoryData(),
          loadAgencyHistoryData()
        ]);

        setOverview(dashboardData.overview);
        setAgencies(dashboardData.agencies || []);
        setServices(servicesData);
        setHistoryData(historyData);
        setAgencyHistoryData(agencyHistoryData);
        setLastUpdated(new Date(dashboardData.lastUpdated || new Date()).toLocaleString('ko-KR'));
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Error loading data:', err);
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
      bestAgenciesCount: 0
    };
  }

  // bestAgency의 정상율과 동일한 정상율을 가진 기관들의 개수 계산
  const bestAgencyRate = overview.bestAgency?.rate || 0;

  // 각 기관별로 현재 정상율 계산
  const agencyRates = new Map();
  services.forEach(service => {
    const agencyId = service.agency.id;
    if (!agencyRates.has(agencyId)) {
      agencyRates.set(agencyId, { total: 0, normal: 0 });
    }
    const stats = agencyRates.get(agencyId);
    stats.total += 1;
    if (service.status === 'normal') {
      stats.normal += 1;
    }
  });

  // bestAgency의 정상율과 동일한 정상율을 가진 기관들의 개수
  const bestAgenciesCount = Array.from(agencyRates.entries()).filter(([, stats]) => {
    const normalRate = stats.total > 0 ? (stats.normal / stats.total) * 100 : 0;
    return Math.abs(normalRate - bestAgencyRate) < 0.01; // 소수점 오차 고려
  }).length;

  const statusData = [
    { name: '정상', value: overview.normalServices, color: '#10B981' },
    { name: '점검중', value: overview.maintenanceServices, color: '#3B82F6' },
    { name: '문제', value: overview.problemServices, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const totalServices = overview.totalServices;

  // 기관별 시간대별 정상율 계산 함수
  const calculateAgencyNormalRate = (agencyId: string, targetDate: Date) => {
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식

    // 해당 기관의 히스토리 데이터 찾기
    const agencyData = agencyHistoryData.find(a => a.agencyId === agencyId);
    if (!agencyData || agencyData.history.length === 0) {
      return null;
    }

    // 해당 날짜의 데이터 필터링 (하루 동안의 모든 시간대)
    const dayData = agencyData.history.filter(h => {
      // timestamp에서 날짜 부분만 추출 (시간대 고려)
      let timestampDateStr;
      if (h.timestamp.includes('GMT+0900')) {
        // "Fri Oct 03 2025 00:00:00 GMT+0900 (Korean Standard Time)" 형식
        const parts = h.timestamp.split(' ');
        const month = parts[1]; // "Oct"
        const day = parts[2];   // "03"
        const year = parts[3];  // "2025"

        // 월 이름을 숫자로 변환
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };

        const monthNum = monthMap[month] || '01';
        timestampDateStr = `${year}-${monthNum}-${day.padStart(2, '0')}`;
      } else {
        // ISO 형식인 경우
        const timestampDate = new Date(h.timestamp);
        timestampDateStr = timestampDate.toISOString().split('T')[0];
      }

      return timestampDateStr === targetDateStr;
    });

    if (dayData.length === 0) {
      return null;
    }

    // 해당 날짜의 모든 시간대 데이터를 합산하여 정상율 계산
    const totalStats = dayData.reduce((acc, h) => ({
      total: acc.total + h.stats.total,
      normal: acc.normal + h.stats.normal,
      maintenance: acc.maintenance + h.stats.maintenance,
      problem: acc.problem + h.stats.problem
    }), { total: 0, normal: 0, maintenance: 0, problem: 0 });

    const normalRate = totalStats.total > 0 ? (totalStats.normal / totalStats.total) * 100 : 0;

    // total이 0보다 크면 정상율 반환 (0%도 유효한 값)
    return totalStats.total > 0 ? normalRate : null;
  };

  // 기관별 통계 데이터 생성
  const agencyStats = Array.from(agencyRates.entries()).map(([agencyId, stats]) => {
    const agency = agencies.find(a => a.agencyId === agencyId);
    const normalRate = stats.total > 0 ? (stats.normal / stats.total) * 100 : 0;

    // 시간대별 정상율 계산
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const day1Rate = calculateAgencyNormalRate(agencyId, yesterday);
    const week1Rate = calculateAgencyNormalRate(agencyId, weekAgo);
    const month1Rate = calculateAgencyNormalRate(agencyId, monthAgo);

    return {
      agencyId: agencyId,
      agency: agency?.name || 'Unknown Agency',
      url: agency?.url || '',
      current: {
        normalRate: normalRate,
        maintenanceRate: 0,
        problemRate: 0
      },
      day1: { normalRate: day1Rate },
      week1: { normalRate: week1Rate },
      month1: { normalRate: month1Rate },
      trend: 0
    };
  });

  // 시간대별 통계
  const generateHourlyData = (): { hour: string; date: string; normalRate: number }[] => {
    const hourlyData: { hour: string; date: string; normalRate: number }[] = [];

    // historyData가 비어있으면 빈 데이터 반환
    if (!historyData || historyData.length === 0) {
      console.log('No history data available');
      return [];
    }

    // 현재 시간을 기준으로 7시간 전부터 현재 시간까지의 시간대 생성
    const now = new Date();
    const currentHour = now.getHours();

    // 7시간 전부터 현재 시간까지의 시간대 배열 생성
    const timeSlots: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const targetHour = currentHour - i;
      // 음수인 경우 전날로 이동
      const adjustedHour = targetHour < 0 ? targetHour + 24 : targetHour;
      timeSlots.push(adjustedHour);
    }

    // 최근 7개 시간대의 데이터 사용
    const recentData = historyData.slice(-7);

    // 날짜 표시를 위한 이전 날짜 추적
    let previousDate = '';

    recentData.forEach((h, index) => {
      // timestamp 파싱
      let timestamp;
      try {
        // ISO 형식인 경우
        if (h.timestamp.includes('T') || h.timestamp.includes('Z')) {
          timestamp = new Date(h.timestamp);
        } else {
          // "Wed Oct 01 2025 12:00:00 GMT+0900" 형식인 경우
          timestamp = new Date(h.timestamp);
        }
      } catch (error) {
        console.error('Error parsing timestamp:', h.timestamp, error);
        return;
      }

      // 실제 데이터의 시간이 아닌, 계산된 시간대 사용
      const displayHour = timeSlots[index] || timestamp.getHours();

      // 현재 시간을 기준으로 날짜 계산
      const now = new Date();
      const currentDate = now.getDate();
      const currentMonth = now.getMonth() + 1;

      // displayHour가 현재 시간보다 크면 전날
      const isPreviousDay = displayHour > now.getHours();
      const targetDate = isPreviousDay ? currentDate - 1 : currentDate;
      const targetMonth = isPreviousDay ? currentMonth : currentMonth;

      const currentDateStr = `${targetMonth}/${targetDate}`;

      // 날짜 표시 조건:
      // 1. 첫 번째 데이터 (index === 0)
      // 2. 0시인 경우 (자정)
      // 3. 이전 데이터와 날짜가 다른 경우
      const shouldShowDate = index === 0 ||
        displayHour === 0 ||
        (index > 0 && previousDate !== currentDateStr);


      // 정상율 계산
      const normalRate = h.overall.total > 0
        ? (h.overall.normal / h.overall.total) * 100
        : 0;

      hourlyData.push({
        hour: `${displayHour}시`,
        date: shouldShowDate ? currentDateStr : '',
        normalRate: Number(normalRate.toFixed(2)),
      });

      // 이전 날짜 업데이트
      previousDate = currentDateStr;
    });
    return hourlyData;
  };

  const hourlyData = generateHourlyData();

  return {
    overview,
    isLoading,
    error,
    lastUpdated,
    statusData,
    totalServices,
    hourlyData,
    agencyStats,
    bestAgenciesCount
  };
}
