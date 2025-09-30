'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Service, FilterOptions } from '@/types/service';
import { loadBackendData } from '@/utils/dataTransform';
import ServiceCard from '@/components/ServiceCard';
import ServiceFilters from '@/components/ServiceFilters';
import StatusGuide from '@/components/StatusGuide';
import WebAppJsonLd from '@/components/WebAppJsonLd';
import { Search, Grid, List, SortAsc, SortDesc, Loader2, AlertCircle } from 'lucide-react';

type SortField = 'name' | 'status' | 'responseTime' | 'agency';
type SortOrder = 'asc' | 'desc';

function ServicesContent() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

  // URL 쿼리 파라미터 처리
  useEffect(() => {
    const agency = searchParams.get('agency');
    if (agency) {
      setFilters(prev => ({
        ...prev,
        search: agency
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadBackendData();
        setServices(data);
        
        // 사용 가능한 하위 카테고리 추출
        const subCategories = [...new Set(data.map(service => service.agency.subCategory))].sort();
        
        setAvailableSubCategories(subCategories);
        setError(null);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAndSortedServices = useMemo(() => {
    const filtered = services.filter(service => {
      // 상태 필터
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(service.status)) return false;
      }

      // 기관 분류 필터
      if (filters.mainCategory && filters.mainCategory.length > 0) {
        if (!filters.mainCategory.includes(service.agency.mainCategory)) return false;
      }


      // 하위 카테고리 필터
      if (filters.subCategory && filters.subCategory.length > 0) {
        if (!filters.subCategory.includes(service.agency.subCategory)) return false;
      }

      // 검색 필터
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          service.name,
          service.agency.name,
          service.agency.subCategory,
          service.description || '',
          ...service.tags
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }

      return true;
    });

    // 정렬
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'status':
          const statusOrder = { normal: 0, maintenance: 1, problem: 2 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case 'responseTime':
          aValue = a.responseTime || 0;
          bValue = b.responseTime || 0;
          break;
        case 'agency':
          aValue = a.agency.name;
          bValue = b.agency.name;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [services, filters, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <SortAsc className="w-4 h-4" /> : 
      <SortDesc className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <WebAppJsonLd
        name="서비스 현황 - 정부 사이트 장애 현황"
        description="모든 정부 서비스의 실시간 상태를 확인하세요. 검색, 필터링, 정렬 기능으로 원하는 서비스를 쉽게 찾을 수 있습니다."
        url="https://gov-status.vercel.app/services"
        applicationCategory="GovernmentApplication"
        operatingSystem="Any"
        author={{
          name: "김루비",
          url: "https://anb-network.com"
        }}
        faq={[
          {
            question: "서비스를 어떻게 검색할 수 있나요?",
            answer: "상단의 검색창에 서비스명이나 기관명을 입력하면 실시간으로 필터링됩니다. 정확한 이름을 모를 경우 부분 검색도 가능합니다."
          },
          {
            question: "필터링 기능은 어떻게 사용하나요?",
            answer: "상태별(정상/점검중/문제), 기관별, 응답시간별로 필터링할 수 있습니다. 여러 필터를 동시에 적용하여 원하는 서비스만 볼 수 있습니다."
          },
          {
            question: "정렬은 어떤 기준으로 할 수 있나요?",
            answer: "서비스명, 상태, 응답시간, 기관명 순으로 오름차순/내림차순 정렬이 가능합니다. 기본적으로 서비스명 순으로 정렬됩니다."
          },
          {
            question: "서비스 카드에서 어떤 정보를 확인할 수 있나요?",
            answer: "서비스명, 기관명, 현재 상태, 응답시간, 마지막 업데이트 시간을 확인할 수 있습니다. 클릭하면 상세 정보를 볼 수 있습니다."
          },
          {
            question: "그리드/리스트 보기는 어떻게 전환하나요?",
            answer: "우측 상단의 그리드/리스트 아이콘을 클릭하여 보기 방식을 전환할 수 있습니다. 그리드는 카드 형태, 리스트는 테이블 형태로 표시됩니다."
          }
        ]}
        breadcrumb={[
          { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
          { name: "서비스 현황", url: "https://gov-status.vercel.app/services", position: 2 }
        ]}
      />
      <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">서비스 현황</h1>
          <p className="mt-2 text-gray-600">
            정부 서비스들의 상태를 확인하고 관리하세요 (10분마다 업데이트)
          </p>
        </div>
      </div>

      {/* 필터 */}
        <ServiceFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={services.length}
          filteredCount={filteredAndSortedServices.length}
          availableSubCategories={availableSubCategories}
        />

      {/* 정렬 및 뷰 옵션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <span className="text-sm font-medium text-gray-700">정렬:</span>
          <div className="flex space-x-2">
            {[
              { field: 'name', label: '서비스명' },
              { field: 'status', label: '상태' },
              { field: 'responseTime', label: '응답시간' },
              { field: 'agency', label: '기관명' }
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field as SortField)}
                className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md transition-colors ${
                  sortField === field
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{label}</span>
                {getSortIcon(field as SortField)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">보기:</span>
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 서비스 목록 */}
      {filteredAndSortedServices.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* 페이지네이션 (필요시 추가) */}
      {filteredAndSortedServices.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-500">
            {filteredAndSortedServices.length}개의 서비스를 표시 중
          </p>
        </div>
      )}

      {/* 상태 기준 안내 */}
      <StatusGuide />
      </div>
    </>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
