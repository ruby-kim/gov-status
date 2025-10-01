import { Service, AgencyStats, ServiceStats, FilterOptions, ServiceStatus } from '../service';
import { AgencyStatus } from '../mongodb';

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
    fastestAgency: { name: string; responseTime: number } | null;
    recentAvgRate: number;
    agencies: AgencyStatus[];
  };
  agencies: {
    agencyId: string;
    name: string;
    url: string;
    mainCategory: string;
    subCategory: string;
    tags: string[];
  }[];
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
