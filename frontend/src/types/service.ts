export type ServiceStatus = 'normal' | 'maintenance' | 'problem';

export interface Service {
  id: string;
  name: string;
  url: string;
  status: ServiceStatus;
  description?: string;
  agency: {
    mainCategory: '중앙행정기관' | '지방자치단체';
    subCategory: string;
    name: string;
  };
  lastChecked: Date;
  responseTime?: number;
  tags: string[];
}

export interface ServiceStats {
  total: number;
  normal: number;
  maintenance: number;
  problem: number;
  normalRate: number;
}

export interface AgencyStats {
  agency: string;
  url?: string;
  current: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
    normalRate: number;
  };
  month1: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
    normalRate: number | null;
  };
  month2: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
    normalRate: number | null;
  };
  month3: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
    normalRate: number | null;
  };
  average: number | null;
  trend: number | null;
}

export interface FilterOptions {
  status?: ServiceStatus[];
  mainCategory?: string[];
  subCategory?: string[];
  search?: string;
}
