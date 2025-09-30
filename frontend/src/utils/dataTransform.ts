import { Service, AgencyStats } from '@/types/service';

export interface DashboardData {
  services: Service[];
  stats: any;
  overview: {
    totalServices: number;
    normalServices: number;
    maintenanceServices: number;
    problemServices: number;
    overallNormalRate: number;
    bestAgency: { name: string; rate: number } | null;
    warningAgencies: number;
    avgResponseTime: number;
    recentAvgRate: number;
  };
  agencyStats: AgencyStats[];
}

export async function loadDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch('/api/redis/dashboard');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}

export async function loadHistoryData(): Promise<any[]> {
  try {
    const response = await fetch('/api/redis/history?days=1');

    if (!response.ok) {
      console.warn(`History API returned ${response.status}, using empty data`);
      return []; // 404나 다른 에러 시 빈 배열 반환
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading history data:', error);
    return []; // 에러 시 빈 배열 반환
  }
}

export async function loadBackendData(): Promise<any[]> {
  try {
    const response = await fetch('/api/redis/services');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading backend data:', error);
    throw error;
  }
}