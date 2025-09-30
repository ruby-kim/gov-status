import { Service, ServiceStatus, AgencyStats, FilterOptions } from '../service';

export interface ServiceCardProps {
  service: Service;
}

export interface StatusCardProps {
  status: ServiceStatus;
  count: number;
  total: number;
}

export interface StatusGuideProps {
  className?: string;
}

export interface ServiceFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  services: Service[];
}

export interface AgencyStatsTableProps {
  agencyStats: AgencyStats[];
}

export interface StatusDistributionChartProps {
  stats: {
    normal: number;
    maintenance: number;
    problem: number;
  };
}

// Re-export from service types
export type { Service, ServiceStatus, AgencyStats, FilterOptions };
