'use client';

import { useMemo, useState } from 'react';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import Header from '@/components/Header';
import ServiceCard from '@/app/services/components/ServiceCard';
import ServiceFilters from '@/components/ServiceFilters';
import StatusGuide from '@/components/StatusGuide';
import PageJsonLd from '@/components/PageJsonLd';
import { FilterOptions } from '@/types/service';
import { useServicesData } from '@/app/services/hooks/useServicesData';
import ServiceToolbar from '@/app/services/components/ServiceToolbar';

export default function ServicesContent() {
  const { services, isLoading, error, lastUpdated } = useServicesData();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortField, setSortField] = useState<'name' | 'status' | 'responseTime'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 필터 + 정렬 결과 메모이제이션
  const filtered = useMemo(() => {
    return services
      .filter(s => {
        if (filters.status?.length && !filters.status.includes(s.status)) return false;
        if (filters.mainCategory?.length && !filters.mainCategory.includes(s.mainCategory)) return false;
        if (filters.subCategory?.length && !filters.subCategory.includes(s.subCategory)) return false;
        if (filters.search) {
          const term = filters.search.toLowerCase();
          const text = [s.name, s.subCategory, ...(s.tags ?? [])].join(' ').toLowerCase();
          if (!text.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order = { normal: 0, maintenance: 1, problem: 2 };
        const aVal = sortField === 'status' ? order[a.status] : (a[sortField] ?? '');
        const bVal = sortField === 'status' ? order[b.status] : (b[sortField] ?? '');
      
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        }
      });
  }, [services, filters, sortField, sortOrder]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );

  return (
    <>
      <PageJsonLd page="services" />
      <div className="space-y-8 pt-28">
        <Header
          title="서비스 현황"
          description="정부 서비스들의 최신 상태를 확인하세요 (10분마다 업데이트)"
          lastUpdated={lastUpdated}
        />

        <ServiceFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={services.length}
          filteredCount={filtered.length}
          availableSubCategories={[...new Set(services.map(s => s.subCategory).filter(Boolean))]}
        />

        <ServiceToolbar
          sortField={sortField}
          sortOrder={sortOrder}
          viewMode={viewMode}
          onSortChange={setSortField}
          onOrderToggle={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
          onViewModeChange={setViewMode}
        />

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filtered.map((s, index) => (
              <ServiceCard
                key={`${s.agencyId}-${s.url || index}`}
                service={s}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        <StatusGuide />
      </div>
    </>
  );
}
