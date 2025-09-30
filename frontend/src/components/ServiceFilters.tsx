'use client';

import { ServiceStatus, FilterOptions } from '@/types/service';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface ServiceFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
  availableSubCategories?: string[];
}

const statusOptions = [
  { value: 'normal', label: '정상', color: 'text-green-600' },
  { value: 'maintenance', label: '점검중', color: 'text-blue-600' },
  { value: 'problem', label: '문제', color: 'text-red-600' }
] as const;

const mainCategoryOptions = [
  { value: '중앙행정기관', label: '중앙행정기관' },
  { value: '지방자치단체', label: '지방자치단체' }
];

export default function ServiceFilters({ 
  filters, 
  onFiltersChange, 
  totalCount, 
  filteredCount,
  availableSubCategories = []
}: ServiceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (status: ServiceStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleMainCategoryChange = (category: string) => {
    const currentCategories = filters.mainCategory || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({ ...filters, mainCategory: newCategories.length > 0 ? newCategories : undefined });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };


  const handleSubCategoryChange = (subCategory: string) => {
    const currentSubCategories = filters.subCategory || [];
    const newSubCategories = currentSubCategories.includes(subCategory)
      ? currentSubCategories.filter(c => c !== subCategory)
      : [...currentSubCategories, subCategory];
    
    onFiltersChange({ ...filters, subCategory: newSubCategories.length > 0 ? newSubCategories : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.status || filters.mainCategory || filters.subCategory || filters.search;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">서비스 필터</h3>
          <span className="text-sm text-gray-500">
            {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}개 서비스
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              <span>필터 초기화</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <Filter className="w-4 h-4" />
            <span>{isExpanded ? '접기' : '필터 열기'}</span>
          </button>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="서비스명, 기관명, 설명으로 검색..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">서비스 상태</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.status?.includes(option.value)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 기관 분류 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기관 분류</label>
            <div className="flex flex-wrap gap-2">
              {mainCategoryOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMainCategoryChange(option.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.mainCategory?.includes(option.value)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>


          {/* 하위 카테고리 필터 */}
          {availableSubCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">하위 분류</label>
              <div className="max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {availableSubCategories.slice(0, 15).map((subCategory) => (
                    <button
                      key={subCategory}
                      onClick={() => handleSubCategoryChange(subCategory)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.subCategory?.includes(subCategory)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {subCategory}
                    </button>
                  ))}
                  {availableSubCategories.length > 15 && (
                    <span className="px-3 py-1 text-sm text-gray-500">
                      +{availableSubCategories.length - 15}개 더
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
