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
