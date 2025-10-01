'use client';

import { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Activity, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { loadDashboardData, loadBackendData, loadHistoryData } from '@/utils/dataTransform';
import { formatPercentage, formatAgencyWithRate } from '@/utils/formatUtils';
import WebAppJsonLd from '@/components/WebAppJsonLd';

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

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [dashboardData, servicesData, historyData] = await Promise.all([
          loadDashboardData(),
          loadBackendData(),
          loadHistoryData()
        ]);
        
        setOverview(dashboardData.overview);
        setAgencies(dashboardData.agencies || []);
        setServices(servicesData);
        setHistoryData(historyData);
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
  
  // 각 기관별로 현재 정상율 계산 (services 데이터 사용)
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

  // 기관별 통계 데이터 생성
  const agencyStats = Array.from(agencyRates.entries()).map(([agencyId, stats]) => {
    const agency = agencies.find(a => a.agencyId === agencyId);
    const normalRate = stats.total > 0 ? (stats.normal / stats.total) * 100 : 0;
    
    return {
      agencyId: agencyId,
      agency: agency?.name || 'Unknown Agency',
      url: agency?.url || '',
      current: {
        normalRate: normalRate,
        maintenanceRate: 0,
        problemRate: 0
      },
      month1: { normalRate: null },
      month2: { normalRate: null },
      month3: { normalRate: null },
      average: normalRate,
      trend: 0
    };
  });

  // 페이지네이션 계산
  const totalItems = agencyStats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencyStats = agencyStats.slice(startIndex, endIndex);

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
  const generateHourlyData = () => {
    const hourlyData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dataTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      dataTime.setMinutes(0, 0, 0);
      const hour = dataTime.getHours();
      const date = dataTime.getDate();
      const month = dataTime.getMonth() + 1;

      const timeWindowStart = dataTime.getTime();
      const timeWindowEnd = dataTime.getTime() + 60 * 60 * 1000;

      const historyInTimeWindow = historyData.filter(h => {
        const hTime = new Date(h.timestamp.replace(/\.\d{6}/, '')).getTime();
        return hTime >= timeWindowStart && hTime < timeWindowEnd;
      });

      let normalRate = 0;
      if (historyInTimeWindow.length > 0) {
        normalRate =
          historyInTimeWindow.reduce((sum, h) => sum + (h.overall.normal / h.overall.total) * 100, 0) /
          historyInTimeWindow.length;
      }

      hourlyData.push({
        hour: `${hour}시`,
        date: i === 6 || hour === 0 ? `${month}/${date}` : '',
        정상율: Number(normalRate.toFixed(2)),
      });
    }
    return hourlyData;
  };

  const hourlyData = generateHourlyData();

  return (
    <>
      <WebAppJsonLd
        name="서비스 분석 - 정부 사이트 장애 현황"
        description="정부 서비스의 상세한 분석 데이터를 확인하세요. 기관별 정상율, 시간대별 트렌드, 서비스 상태 분포 등을 실시간으로 모니터링합니다."
        url="https://gov-status.vercel.app/analytics"
        applicationCategory="GovernmentApplication"
        operatingSystem="Any"
        author={{
          name: "김루비",
          url: "https://anb-network.com"
        }}
        faq={[
          {
            question: "기관별 정상율은 어떻게 계산되나요?",
            answer: "각 기관의 서비스 중 정상 작동하는 서비스의 비율을 백분율로 표시합니다. 3개월간의 평균값과 현재값을 비교할 수 있습니다."
          },
          {
            question: "시간대별 트렌드는 어떤 데이터를 보여주나요?",
            answer: "최근 7시간 동안의 전체 서비스 정상율 변화를 시간대별로 표시합니다. 서비스 이용 패턴을 파악할 수 있습니다."
          },
          {
            question: "상위 10개 기관은 어떤 기준으로 선정되나요?",
            answer: "현재 정상율 기준으로 상위 10개 기관을 선정하여 표시합니다. 동일한 정상율일 경우 랜덤하게 선택됩니다."
          },
          {
            question: "3개월 데이터는 어떻게 활용할 수 있나요?",
            answer: "장기적인 서비스 안정성 트렌드를 파악하고, 개선이 필요한 기관을 식별하는 데 활용할 수 있습니다."
          }
        ]}
        breadcrumb={[
          { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
          { name: "서비스 분석", url: "https://gov-status.vercel.app/analytics", position: 2 }
        ]}
      />
      <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">서비스 분석</h1>
          <p className="mt-2 text-gray-600">정부 서비스들의 상세 통계 및 3개월 트렌드 분석</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>마지막 업데이트: {lastUpdated || '로딩 중...'}</span>
          </div>
        </div>
      </div>

      {/* 주요 지표 */}
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

      {/* 차트 섹션 - 데스크톱에서 나란히 배치 */}
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
                <Line dataKey="정상율" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 기관별 상세 테이블 */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4 lg:p-6 text-sm sm:text-base md:text-lg w-full">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
            기관별 3개월 정상율 상세 통계
          </h3>

          <div 
            className="overflow-x-auto -mx-2 sm:mx-0" 
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <table className="w-full divide-y divide-gray-200" style={{ width: '100%' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">기관명</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">현재</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase hidden sm:table-cell">1개월 전</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase hidden sm:table-cell">2개월 전</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase hidden sm:table-cell">3개월 전</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">평균</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">↗</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAgencyStats.map((agency, index: number) => {
                  const avgRate = agency.average;
                  const trend = agency.trend;
                  return (
                    <tr key={agency.agencyId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-medium text-gray-900" style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                        <a
                          href={agency.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {agency.agency}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {formatPercentage(agency.current.normalRate)}
                      </td>
                      <td className="px-3 py-2 text-center hidden sm:table-cell">
                        {agency.month1.normalRate ? formatPercentage(agency.month1.normalRate) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center hidden sm:table-cell">
                        {agency.month2.normalRate ? formatPercentage(agency.month2.normalRate) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center hidden sm:table-cell">
                        {agency.month3.normalRate ? formatPercentage(agency.month3.normalRate) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {avgRate ? formatPercentage(avgRate) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center">{trend ? trend.toFixed(1) : 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <label className="font-medium text-gray-700">페이지당:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
            <div className="text-gray-700">
              {startIndex + 1}-{Math.min(endIndex, totalItems)} / {totalItems}개
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1 border rounded-md disabled:opacity-50">처음</button>
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 border rounded-md disabled:opacity-50">이전</button>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 border rounded-md disabled:opacity-50">다음</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1 border rounded-md disabled:opacity-50">마지막</button>
            </div>
          </div>
        </div>
      </div>

      </div>
    </>
  );
}