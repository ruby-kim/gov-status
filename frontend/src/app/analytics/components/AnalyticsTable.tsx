import { useState, useEffect, useRef } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { formatPercentage } from '@/utils/formatUtils';

interface AgencyStats {
  agencyId: string;
  agency: string;
  url: string;
  current: {
    normalRate: number;
    maintenanceRate: number;
    problemRate: number;
  };
  day1: { normalRate: number | null };
  week1: { normalRate: number | null };
  month1: { normalRate: number | null };
  trend: number;
}

interface AnalyticsTableProps {
  agencyStats: AgencyStats[];
}

export default function AnalyticsTable({ agencyStats }: AnalyticsTableProps) {
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // 검색, 필터링, 정렬 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'agency' | 'current' | 'day1' | 'week1' | 'month1'>('current');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'improved' | 'declined' | 'stable'>('all');
  
  // 페이지 입력 상태
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState('');
  
  // 드롭다운 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 필터 옵션
  const filterOptions = [
    { value: 'all', label: '전체' },
    { value: 'improved', label: '개선됨' },
    { value: 'declined', label: '악화됨' },
    { value: 'stable', label: '안정적' }
  ];

  const handleFilterChange = (value: 'all' | 'improved' | 'declined' | 'stable') => {
    setFilterStatus(value);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 필터링 및 정렬 로직
  const filteredAndSortedAgencyStats = agencyStats
    .filter(agency => {
      // 검색 필터
      if (searchTerm && !agency.agency.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 상태 필터
      if (filterStatus !== 'all') {
        const currentRate = agency.current.normalRate;
        const yesterdayRate = agency.day1.normalRate;
        
        if (filterStatus === 'improved' && (!yesterdayRate || currentRate <= yesterdayRate)) {
          return false;
        }
        if (filterStatus === 'declined' && (!yesterdayRate || currentRate >= yesterdayRate)) {
          return false;
        }
        if (filterStatus === 'stable' && yesterdayRate && Math.abs(currentRate - yesterdayRate) > 0.1) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortField) {
        case 'agency':
          return sortOrder === 'asc' 
            ? a.agency.localeCompare(b.agency)
            : b.agency.localeCompare(a.agency);
        case 'current':
          aValue = a.current.normalRate;
          bValue = b.current.normalRate;
          break;
        case 'day1':
          aValue = a.day1.normalRate || 0;
          bValue = b.day1.normalRate || 0;
          break;
        case 'week1':
          aValue = a.week1.normalRate || 0;
          bValue = b.week1.normalRate || 0;
          break;
        case 'month1':
          aValue = a.month1.normalRate || 0;
          bValue = b.month1.normalRate || 0;
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // 페이지네이션 계산
  const totalItems = filteredAndSortedAgencyStats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencyStats = filteredAndSortedAgencyStats.slice(startIndex, endIndex);

  // 페이지 입력 처리 함수들
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 입력 허용
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInput);
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
        setIsEditingPage(false);
        setPageInput('');
      } else {
        // 유효하지 않은 페이지 번호인 경우 현재 페이지로 리셋
        setPageInput(currentPage.toString());
      }
    } else if (e.key === 'Escape') {
      setIsEditingPage(false);
      setPageInput('');
    }
  };

  const handlePageInputBlur = () => {
    setIsEditingPage(false);
    setPageInput('');
  };

  // 페이지 번호 클릭/터치 처리
  const handlePageNumberClick = () => {
    setIsEditingPage(true);
    setPageInput(currentPage.toString());
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-4 lg:p-6 text-xs sm:text-sm md:text-base lg:text-lg w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            기관별 정상율 상세 통계
          </h3>
          
          {/* 검색 및 필터 컨트롤 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="기관명 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
              />
            </div>
            
            {/* 상태 필터 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between min-w-[120px]"
              >
                <span>{filterOptions.find(option => option.value === filterStatus)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value as 'all' | 'improved' | 'declined' | 'stable')}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-md last:rounded-b-md ${
                        filterStatus === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div 
          className="overflow-x-auto -mx-2 sm:mx-0" 
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <table className="w-full divide-y divide-gray-200" style={{ width: '100%' }}>
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left">
                  <button
                    onClick={() => {
                      if (sortField === 'agency') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('agency');
                        setSortOrder('asc');
                      }
                    }}
                    className="group flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all duration-200"
                  >
                    <span>기관명</span>
                    <div className="flex flex-col">
                      {sortField === 'agency' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-blue-500" />
                      )}
                    </div>
                  </button>
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                  <button
                    onClick={() => {
                      if (sortField === 'current') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('current');
                        setSortOrder('desc');
                      }
                    }}
                    className="group flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all duration-200 mx-auto"
                  >
                    <span>오늘</span>
                    <div className="flex flex-col">
                      {sortField === 'current' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-blue-500" />
                      )}
                    </div>
                  </button>
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                  <button
                    onClick={() => {
                      if (sortField === 'day1') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('day1');
                        setSortOrder('desc');
                      }
                    }}
                    className="group flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all duration-200 mx-auto"
                  >
                    <span>하루 전</span>
                    <div className="flex flex-col">
                      {sortField === 'day1' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-blue-500" />
                      )}
                    </div>
                  </button>
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                  <button
                    onClick={() => {
                      if (sortField === 'week1') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('week1');
                        setSortOrder('desc');
                      }
                    }}
                    className="group flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all duration-200 mx-auto"
                  >
                    <span>일주일 전</span>
                    <div className="flex flex-col">
                      {sortField === 'week1' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-blue-500" />
                      )}
                    </div>
                  </button>
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                  <button
                    onClick={() => {
                      if (sortField === 'month1') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('month1');
                        setSortOrder('desc');
                      }
                    }}
                    className="group flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all duration-200 mx-auto"
                  >
                    <span>1달 전</span>
                    <div className="flex flex-col">
                      {sortField === 'month1' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-blue-500" />
                      )}
                    </div>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAgencyStats.map((agency) => {
                const getCurrentRateColor = () => {
                  if (agency.day1.normalRate === null) return 'text-gray-900'; // 어제 데이터가 없으면 기본 색상
                  
                  const currentRate = agency.current.normalRate;
                  const yesterdayRate = agency.day1.normalRate;
                  const difference = currentRate - yesterdayRate;
                  
                  if (difference > 0) return 'text-green-600'; // 상승
                  if (difference < 0) return 'text-red-600'; // 하락
                  return 'text-gray-900'; // 동일
                };

                return (
                  <tr key={agency.agencyId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-3 font-medium text-gray-900" style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                      <a
                        href={agency.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150"
                      >
                        {agency.agency}
                      </a>
                    </td>
                    <td className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-3 text-center font-semibold ${getCurrentRateColor()}`}>
                      {formatPercentage(agency.current.normalRate)}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-3 text-center text-gray-700">
                      {agency.day1.normalRate !== null ? formatPercentage(agency.day1.normalRate) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-3 text-center text-gray-700">
                      {agency.week1.normalRate !== null ? formatPercentage(agency.week1.normalRate) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-3 text-center text-gray-700">
                      {agency.month1.normalRate !== null ? formatPercentage(agency.month1.normalRate) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <label className="font-medium text-gray-700 text-sm">페이지당:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={30}>30개</option>
              <option value={50}>50개</option>
            </select>
          </div>
          
          <div className="text-gray-600 text-sm">
            <span className="font-medium">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> / {totalItems}개
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1} 
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              처음
            </button>
            <button 
              onClick={() => setCurrentPage(currentPage - 1)} 
              disabled={currentPage === 1} 
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              이전
            </button>
            {isEditingPage ? (
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                onBlur={handlePageInputBlur}
                className="w-12 px-2 py-2 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            ) : (
              <span 
                className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors duration-150 select-none"
                onClick={handlePageNumberClick}
                title="클릭하여 페이지 번호 입력"
              >
                {currentPage} / {totalPages}
              </span>
            )}
            <button 
              onClick={() => setCurrentPage(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              다음
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages} 
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              마지막
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
