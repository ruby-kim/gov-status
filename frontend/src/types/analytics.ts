import type { Service } from '@/types/service';

export interface AnalyticsOverviewProps {
  overview: OverviewData;
  bestAgenciesCount: number;
}

export interface OverviewData {
  totalServices: number;
  normalServices: number;
  maintenanceServices: number;
  problemServices: number;
  overallNormalRate: number;
  bestAgency: { name: string; rate: number } | null;
  warningAgencies: number;
  avgResponseTime: number;
  fastestAgency: { name: string; responseTime: number } | null;
}

export interface Agency {
  agencyId: string;
  name: string;
  url: string;
  mainCategory: string;
  subCategory: string;
  tags: string[];
}

export interface AnalyticsService {
  agency: {
    id: string;
    name: string;
    url?: string;
    mainCategory?: string;
    subCategory?: string;
    tags?: string[];
  };
}

export interface AnalyticsDashboardData {
  overview: OverviewData;
  agencies: Agency[];
  lastUpdated: string;
}

export interface ServicesResponse {
  services: Service[];
  lastUpdated?: string;
}

export interface HistoryData {
  timestamp: string;
  overall: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
  };
}
