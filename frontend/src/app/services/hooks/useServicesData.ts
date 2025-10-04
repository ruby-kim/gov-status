'use client';

import { useEffect, useState } from 'react';
import { Service } from '@/types/service';

export function useServicesData() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setServices(data.services);
        setLastUpdated(data.lastUpdated);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { services, isLoading, error, lastUpdated };
}
