export interface SiteStatus {
  agencyId: string;
  status: 'normal' | 'maintenance' | 'problem';
  responseTime?: number;
}

export interface OverallStats {
  total: number;
  normal: number;
  maintenance: number;
  problem: number;
}

export interface Agency {
  agencyId: string;
  name: string;
}

export interface DashboardData {
  stats: {
    overall: OverallStats;
  };
  lastUpdated: string;
  overview: {
    totalServices: number;
    normalServices: number;
    maintenanceServices: number;
    problemServices: number;
    overallNormalRate: number;
    bestAgencies: {
      agencyId: string;
      name: string;
      rate: number;
    }[];
    warningAgencies: number;
    avgResponseTime: number;
    top3FastestServices: {
      rank: number;
      name: string;
      responseTime: number;
      status: string;
    }[];
  };
}
