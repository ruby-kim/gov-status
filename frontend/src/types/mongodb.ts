// MongoDB 컬렉션 타입 정의
export interface Agency {
  _id?: string;
  agencyId: string;
  name: string;
  url: string;
  mainCategory: string;
  subCategory: string;
  tags: string[];
}

export interface HourlyStats {
  _id?: string;
  agencyId: string;
  timestampHour: string; // ISO string
  stats: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
  };
}

export interface AgencyStatus {
  agencyId: string;
  status: 'normal' | 'maintenance' | 'problem';
  responseTime?: number; // 응답시간 (ms)
}

export interface OverallStats {
  _id?: string;
  timestamp: string; // ISO string
  overall: {
    total: number;
    normal: number;
    maintenance: number;
    problem: number;
  };
  agencies: AgencyStatus[];
}
