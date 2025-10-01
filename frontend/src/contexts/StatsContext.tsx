'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AgencyWithStatus {
  agencyId: string;
  name: string;
  url: string;
  mainCategory: string;
  subCategory: string;
  status: 'normal' | 'maintenance' | 'problem';
  tags: string[];
}

interface StatsData {
  overview: {
    totalServices: number;
    normalServices: number;
    maintenanceServices: number;
    problemServices: number;
    totalAgencies: number;
    overallNormalRate: number;
    lastUpdated: string;
    bestAgency: { name: string; rate: number } | null;
    warningAgencies: number;
    avgResponseTime: number;
    fastestAgency: { name: string; responseTime: number } | null;
  };
  agencies: AgencyWithStatus[];
  statusDistribution: {
    normal: number;
    maintenance: number;
    problem: number;
  };
}

interface StatsContextType {
  stats: StatsData | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  // 편의 함수들
  getOverview: () => StatsData['overview'] | null;
  getAgencies: () => AgencyWithStatus[];
  getAgenciesByStatus: (status: 'normal' | 'maintenance' | 'problem') => AgencyWithStatus[];
  getAgenciesByCategory: (mainCategory: string) => AgencyWithStatus[];
  getStatusDistribution: () => StatsData['statusDistribution'] | null;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

interface StatsProviderProps {
  children: ReactNode;
}

export const StatsProvider: React.FC<StatsProviderProps> = ({ children }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/mongodb/comprehensive-stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // 편의 함수들
  const getOverview = () => stats?.overview || null;
  const getAgencies = () => stats?.agencies || [];
  const getAgenciesByStatus = (status: 'normal' | 'maintenance' | 'problem') => 
    stats?.agencies.filter(agency => agency.status === status) || [];
  const getAgenciesByCategory = (mainCategory: string) => 
    stats?.agencies.filter(agency => agency.mainCategory === mainCategory) || [];
  const getStatusDistribution = () => stats?.statusDistribution || null;

  const value: StatsContextType = {
    stats,
    isLoading,
    error,
    refreshStats,
    getOverview,
    getAgencies,
    getAgenciesByStatus,
    getAgenciesByCategory,
    getStatusDistribution
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};
