import { Service, AgencyStats, ServiceStats, FilterOptions, ServiceStatus } from '../service';

export interface DashboardData {
  services: Service[];
  stats: Record<string, unknown>;
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
  lastUpdated?: string;
}

export interface HistoryData {
  timestamp: string;
  overall: {
    normal: number;
    total: number;
  };
}

export interface StatsResponse {
  totalServices: number;
  normalServices: number;
  maintenanceServices: number;
  problemServices: number;
  totalAgencies: number;
  lastUpdated: string;
}

// Re-export from service types
export type { Service, AgencyStats, ServiceStats, FilterOptions, ServiceStatus };
