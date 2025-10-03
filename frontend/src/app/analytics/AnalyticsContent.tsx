'use client';

import { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Activity, AlertTriangle, Loader2, AlertCircle, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { loadDashboardData, loadBackendData, loadHistoryData, loadAgencyHistoryData } from '@/utils/dataTransform';
import { formatPercentage, formatAgencyWithRate } from '@/utils/formatUtils';
import PageJsonLd from '@/components/PageJsonLd';

import { HistoryData } from '@/types/api/dashboard';

export default function AnalyticsContent() {
  const [overview, setOverview] = useState<{
    totalServices: number;
    normalServices: number;
    maintenanceServices: number;
    problemServices: number;
    overallNormalRate: number;
    bestAgency: { name: string; rate: number } | null;
    warningAgencies: number;
    avgResponseTime: number;
    fastestAgency: { name: string; responseTime: number } | null;
  } | null>(null);
  const [agencies, setAgencies] = useState<{
    agencyId: string;
    name: string;
    url: string;
    mainCategory: string;
    subCategory: string;
    tags: string[];
  }[]>([]);
  const [services, setServices] = useState<{
    id: string;
    name: string;
    url: string;
    status: 'normal' | 'maintenance' | 'problem';
    agency: {
      id: string;
      name: string;
      mainCategory: string;
      subCategory: string;
    };
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [agencyHistoryData, setAgencyHistoryData] = useState<Array<{
    agencyId: string;
    history: Array<{
      timestamp: string;
      normalRate: number;
      stats: { total: number; normal: number; maintenance: number; problem: number };
    }>;
  }>>([]);

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
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [dashboardData, servicesData, historyData, agencyHistoryData] = await Promise.all([
          loadDashboardData(),
          loadBackendData(),
          loadHistoryData(),
          loadAgencyHistoryData()
        ]);
        
        setOverview(dashboardData.overview);
        setAgencies(dashboardData.agencies || []);
        setServices(servicesData);
        setHistoryData(historyData);
        setAgencyHistoryData(agencyHistoryData);
        setLastUpdated(new Date(dashboardData.lastUpdated || new Date()).toLocaleString('ko-KR'));
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  // bestAgency의 정상율과 동일한 정상율을 가진 기관들의 개수 계산
  const bestAgencyRate = overview.bestAgency?.rate || 0;
  
  // 각 기관별로 현재 정상율 계산
  const agencyRates = new Map();
  services.forEach(service => {
    const agencyId = service.agency.id;
    if (!agencyRates.has(agencyId)) {
      agencyRates.set(agencyId, { total: 0, normal: 0 });
    }
    const stats = agencyRates.get(agencyId);
    stats.total += 1;
    if (service.status === 'normal') {
      stats.normal += 1;
    }
  });
  
  // bestAgency의 정상율과 동일한 정상율을 가진 기관들의 개수
  const bestAgenciesCount = Array.from(agencyRates.entries()).filter(([, stats]) => {
    const normalRate = stats.total > 0 ? (stats.normal / stats.total) * 100 : 0;
    return Math.abs(normalRate - bestAgencyRate) < 0.01; // 소수점 오차 고려
  }).length;

  const statusData = [
    { name: '정상', value: overview.normalServices, color: '#10B981' },
    { name: '점검중', value: overview.maintenanceServices, color: '#3B82F6' },
    { name: '문제', value: overview.problemServices, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const totalServices = overview.totalServices;

  // 기관별 시간대별 정상율 계산 함수
  const calculateAgencyNormalRate = (agencyId: string, targetDate: Date) => {
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    // 해당 기관의 히스토리 데이터 찾기
    const agencyData = agencyHistoryData.find(a => a.agencyId === agencyId);
    if (!agencyData || agencyData.history.length === 0) {
      return null;
    }
    
    // 해당 날짜의 데이터 필터링 (하루 동안의 모든 시간대)
    const dayData = agencyData.history.filter(h => {
      // timestamp에서 날짜 부분만 추출 (시간대 고려)
      let timestampDateStr;
      if (h.timestamp.includes('GMT+0900')) {
        // "Fri Oct 03 2025 00:00:00 GMT+0900 (Korean Standard Time)" 형식
        const parts = h.timestamp.split(' ');
        const month = parts[1]; // "Oct"
        const day = parts[2];   // "03"
        const year = parts[3];  // "2025"
        
        // 월 이름을 숫자로 변환
        const monthMap: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        const monthNum = monthMap[month] || '01';
        timestampDateStr = `${year}-${monthNum}-${day.padStart(2, '0')}`;
      } else {
        // ISO 형식인 경우
        const timestampDate = new Date(h.timestamp);
        timestampDateStr = timestampDate.toISOString().split('T')[0];
      }
      
      return timestampDateStr === targetDateStr;
    });
    
    if (dayData.length === 0) {
      return null;
    }
    
    // 해당 날짜의 모든 시간대 데이터를 합산하여 정상율 계산
    const totalStats = dayData.reduce((acc, h) => ({
      total: acc.total + h.stats.total,
      normal: acc.normal + h.stats.normal,
      maintenance: acc.maintenance + h.stats.maintenance,
      problem: acc.problem + h.stats.problem
    }), { total: 0, normal: 0, maintenance: 0, problem: 0 });
    
    const normalRate = totalStats.total > 0 ? (totalStats.normal / totalStats.total) * 100 : 0;
    
    // total이 0보다 크면 정상율 반환 (0%도 유효한 값)
    return totalStats.total > 0 ? normalRate : null;
  };

  // 기관별 통계 데이터 생성
  const agencyStats = Array.from(agencyRates.entries()).map(([agencyId, stats]) => {
    const agency = agencies.find(a => a.agencyId === agencyId);
    const normalRate = stats.total > 0 ? (stats.normal / stats.total) * 100 : 0;
    
    // 시간대별 정상율 계산
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const day1Rate = calculateAgencyNormalRate(agencyId, yesterday);
    const week1Rate = calculateAgencyNormalRate(agencyId, weekAgo);
    const month1Rate = calculateAgencyNormalRate(agencyId, monthAgo);
    
    return {
      agencyId: agencyId,
      agency: agency?.name || 'Unknown Agency',
      url: agency?.url || '',
      current: {
        normalRate: normalRate,
        maintenanceRate: 0,
        problemRate: 0
      },
      day1: { normalRate: day1Rate },
      week1: { normalRate: week1Rate },
      month1: { normalRate: month1Rate },
      trend: 0
    };
  });

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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0] as { name: string; value: number };
      const percentage = formatPercentage((data.value / totalServices) * 100);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toLocaleString()}개 ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // 시간대별 통계
  const generateHourlyData = (): { hour: string; date: string; normalRate: number }[] => {
    const hourlyData: { hour: string; date: string; normalRate: number }[] = [];
    
    // historyData가 비어있으면 빈 데이터 반환
    if (!historyData || historyData.length === 0) {
      console.log('No history data available');
      return [];
    }

    // 현재 시간을 기준으로 7시간 전부터 현재 시간까지의 시간대 생성
    const now = new Date();
    const currentHour = now.getHours();
    
    // 7시간 전부터 현재 시간까지의 시간대 배열 생성
    const timeSlots: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const targetHour = currentHour - i;
      // 음수인 경우 전날로 이동
      const adjustedHour = targetHour < 0 ? targetHour + 24 : targetHour;
      timeSlots.push(adjustedHour);
    }

    // 최근 7개 시간대의 데이터 사용
    const recentData = historyData.slice(-7);
    
    // 날짜 표시를 위한 이전 날짜 추적
    let previousDate = '';
    
    recentData.forEach((h, index) => {
      // timestamp 파싱
      let timestamp;
      try {
        // ISO 형식인 경우
        if (h.timestamp.includes('T') || h.timestamp.includes('Z')) {
          timestamp = new Date(h.timestamp);
        } else {
          // "Wed Oct 01 2025 12:00:00 GMT+0900" 형식인 경우
          timestamp = new Date(h.timestamp);
        }
      } catch (error) {
        console.error('Error parsing timestamp:', h.timestamp, error);
        return;
      }

      // 실제 데이터의 시간이 아닌, 계산된 시간대 사용
      const displayHour = timeSlots[index] || timestamp.getHours();
      
      // 현재 시간을 기준으로 날짜 계산
      const now = new Date();
      const currentDate = now.getDate();
      const currentMonth = now.getMonth() + 1;
      
      // displayHour가 현재 시간보다 크면 전날
      const isPreviousDay = displayHour > now.getHours();
      const targetDate = isPreviousDay ? currentDate - 1 : currentDate;
      const targetMonth = isPreviousDay ? currentMonth : currentMonth;
      
      const currentDateStr = `${targetMonth}/${targetDate}`;

      // 날짜 표시 조건:
      // 1. 첫 번째 데이터 (index === 0)
      // 2. 0시인 경우 (자정)
      // 3. 이전 데이터와 날짜가 다른 경우
      const shouldShowDate = index === 0 || 
                           displayHour === 0 || 
                           (index > 0 && previousDate !== currentDateStr);


      // 정상율 계산
      const normalRate = h.overall.total > 0 
        ? (h.overall.normal / h.overall.total) * 100 
        : 0;

      hourlyData.push({
        hour: `${displayHour}시`,
        date: shouldShowDate ? currentDateStr : '',
        normalRate: Number(normalRate.toFixed(2)),
      });

      // 이전 날짜 업데이트
      previousDate = currentDateStr;
    });
    return hourlyData;
  };

  const hourlyData = generateHourlyData();

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
    <>
      <PageJsonLd page="analytics" />
      <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">서비스 분석</h1>
          <p className="mt-2 text-gray-600">정부 서비스들의 상세 통계 및 1개월 트렌드 분석</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>마지막 업데이트: {lastUpdated || '로딩 중...'}</span>
          </div>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="mb-2">
        <p className="text-sm text-gray-500">※ 최신 수집 데이터 기준</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">전체 정상율</dt>
                <dd className="text-xl lg:text-2xl font-bold text-gray-900">
                  {formatPercentage(overview.overallNormalRate)}
                </dd>
                <dd className="text-xs text-gray-500 mt-1">
                  총 {overview.totalServices.toLocaleString()}개 중 {overview.normalServices.toLocaleString()}개 정상
                </dd>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">최고 정상율 기관</dt>
                <dd className="text-lg lg:text-xl font-bold text-gray-900">
                  {overview.bestAgency ? 
                    formatAgencyWithRate(overview.bestAgency.name, overview.bestAgency.rate) : 'N/A'}
                </dd>
                {bestAgenciesCount > 1 && (
                  <dd className="text-xs text-gray-500 mt-1">
                    외 {bestAgenciesCount - 1}개
                  </dd>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">주의 필요 기관</dt>
                <dd className="text-xl lg:text-2xl font-bold text-gray-900">{overview.warningAgencies}개</dd>
                <dd className="text-xs text-gray-500 mt-1">
                  총 {overview.totalServices.toLocaleString()}개 중 {overview.warningAgencies.toLocaleString()}개 주의 필요
                </dd>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <dt className="text-sm font-medium text-gray-500">평균 응답시간</dt>
                <dd className="text-xl lg:text-2xl font-bold text-gray-900">{overview.avgResponseTime}ms</dd>
                <dd className="text-xs text-gray-500 mt-1">
                  {overview.fastestAgency ? `가장 빠른 기관: ${overview.fastestAgency.name} (${overview.fastestAgency.responseTime}ms)` : 'N/A'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 서비스 상태 분포 */}
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 상태 분포</h3>
          <div className="h-[25vh] sm:h-[30vh] md:h-[40vh] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry?.color, fontSize: '12px' }}>
                      {value} ({formatPercentage((entry?.payload?.value || 0) / totalServices * 100)})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 시간대별 트렌드 */}
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">시간대별 서비스 정상율 트렌드</h3>
          <div className="h-[25vh] sm:h-[30vh] md:h-[40vh] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" angle={-30} textAnchor="end" fontSize={10}/>
                <YAxis fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value}%`, 
                    '정상율'
                  ]}
                  labelFormatter={(label: string, payload: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return `${data.date ? data.date + ' ' : ''}${label}`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line dataKey="normalRate" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 기관별 상세 테이블 */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-4 lg:p-6 text-xs sm:text-sm md:text-base lg:text-lg w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
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
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as 'all' | 'improved' | 'declined' | 'stable');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체</option>
                <option value="improved">개선됨</option>
                <option value="declined">악화됨</option>
                <option value="stable">안정적</option>
              </select>
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
                {paginatedAgencyStats.map((agency, index: number) => {
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

      </div>
    </>
  );
}