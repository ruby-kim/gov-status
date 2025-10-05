export type ServiceStatus = 'normal' | 'maintenance' | 'problem';

export interface Services {
  agencyId: string;
  name: string;
  url: string;
  mainCategory: string;
  subCategory: string;
  tags: string[];
}

export interface Service extends Services {
  id: string;
  status: ServiceStatus;
  responseTime?: number | null;
  lastChecked: string | Date;
}

export interface FilterOptions {
  status?: ServiceStatus[];
  mainCategory?: string[];
  subCategory?: string[];
  search?: string;
}

export interface ServiceStats {
  total: number;
  normal: number;
  maintenance: number;
  problem: number;
  normalRate?: number;
}

export interface AgencyStats {
  agencyId: string;
  agency: string;
  url: string;
  current: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
    normalRate: number;
  };
  day1?: { normalRate: number | null };
  week1?: { normalRate: number | null };
  month1?: { normalRate: number | null };
  trend?: number;
}
