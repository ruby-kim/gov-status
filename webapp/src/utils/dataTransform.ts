import { Service } from '@/types/service';
import { DashboardData } from '@/types/dashboard';
import { HistoryData } from '@/types/analytics';

// ---------------------------------------------------------------------
// 대시보드 데이터 (전체 통계)
// ---------------------------------------------------------------------
export async function loadDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch('/api/dashboard', {
      next: { revalidate: 180 },
    });

    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('🚨 Error loading dashboard data:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------
// 서비스 상태 데이터 (현재 기관별 상태)
// ---------------------------------------------------------------------
export async function loadServiceData(): Promise<Service[]> {
  try {
    const response = await fetch('/api/services', {
      next: { revalidate: 180 },
    });

    if (!response.ok) {
      throw new Error(`Services API error: ${response.status}`);
    }

    const data = await response.json();
    return data.services || data; // 백엔드가 { services, lastUpdated } 형태
  } catch (error) {
    console.error('🚨 Error loading services data:', error);
    return [];
  }
}

// ---------------------------------------------------------------------
// 시간대별 정상율 데이터 (최근 6시간 트렌드)
// ---------------------------------------------------------------------
export async function loadHistoryData(): Promise<HistoryData[]> {
  try {
    const response = await fetch('/api/analytics/history', {
      next: { revalidate: 180 },
    });

    if (!response.ok) {
      console.warn(`History API returned ${response.status}, using empty data`);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('🚨 Error loading history data:', error);
    return [];
  }
}

// ---------------------------------------------------------------------
// 기관별 과거 통계 데이터 (오늘 / 어제 / 주간 / 월간)
// ---------------------------------------------------------------------
export async function loadAgencyHistoryData(): Promise<
  Array<{
    agencyId: string;
    history: Array<{
      timestamp: string;
      normalRate: number;
      stats: { total: number; normal: number; maintenance: number; problem: number };
    }>;
  }>
> {
  try {
    const response = await fetch('/api/analytics/agency-history', {
      next: { revalidate: 180 },
    });

    if (!response.ok) {
      console.warn(`Agency history API returned ${response.status}, using empty data`);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('🚨 Error loading agency history data:', error);
    return [];
  }
}
