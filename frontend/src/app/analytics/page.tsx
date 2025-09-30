'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Activity, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { loadDashboardData, loadHistoryData } from '@/utils/dataTransform';

import { DashboardData } from '@/types/api/dashboard';

import { HistoryData } from '@/types/api/dashboard';

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboard, history] = await Promise.all([
          loadDashboardData(),
          loadHistoryData()
        ]);
        setDashboardData(dashboard);
        setHistoryData(history);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
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

  if (!dashboardData) return null;

  const { overview, agencyStats } = dashboardData;

  // 최고 정상율 기관들 찾기 (현재 사용하지 않음)

  // 페이지네이션 계산
  const totalItems = agencyStats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencyStats = agencyStats.slice(startIndex, endIndex);

  // 차트 데이터
  const shuffledAgencyStats = [...agencyStats].sort((a, b) => {
    const rateDiff = b.current.normalRate - a.current.normalRate;
    if (rateDiff !== 0) return rateDiff;
    return Math.random() - 0.5;
  });

  const chartData = shuffledAgencyStats.slice(0, 10).map(agency => ({
    name: agency.agency,
    정상율: agency.current.normalRate
  }));

  const statusData = [
    { name: '정상', value: overview.normalServices, color: '#10B981' },
    { name: '점검중', value: overview.maintenanceServices, color: '#3B82F6' },
    { name: '문제', value: overview.problemServices, color: '#EF4444' }
  ];

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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">서비스 분석</h1>
        <p className="mt-2 text-gray-600">정부 서비스들의 상세 통계 및 3개월 트렌드 분석</p>
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
                  {overview.overallNormalRate.toFixed(1)}%
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
                  {overview.bestAgency ? `${overview.bestAgency.name} (${overview.bestAgency.rate.toFixed(1)}%)` : 'N/A'}
                </dd>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 섹션 - 데스크톱에서 나란히 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기관별 정상율 차트 */}
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기관별 정상율 (상위 10개)</h3>
          <div className="h-[30vh] sm:h-[40vh] md:h-[50vh] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" fontSize={10}/>
                <YAxis fontSize={10}/>
                <Tooltip />
                <Bar dataKey="정상율" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 서비스 상태 분포 */}
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 상태 분포</h3>
          <div className="h-[30vh] sm:h-[40vh] md:h-[50vh] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius="70%" dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}개`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 시간대별 트렌드 */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시간대별 서비스 정상율 트렌드</h3>
        <div className="h-[30vh] sm:h-[40vh] md:h-[50vh] w-full">
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
                    <tr key={agency.agency} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
                        {agency.current.normalRate === 100 ? '100%' : agency.current.normalRate === 0 ? '0%' : `${agency.current.normalRate.toFixed(1)}%`}
                      </td>
                      <td className="px-3 py-2 text-center hidden sm:table-cell">
                        {agency.month1.normalRate ? (agency.month1.normalRate === 100 ? '100%' : agency.month1.normalRate === 0 ? '0%' : `${agency.month1.normalRate.toFixed(1)}%`) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center hidden sm:table-cell">
                        {agency.month2.normalRate ? (agency.month2.normalRate === 100 ? '100%' : agency.month2.normalRate === 0 ? '0%' : `${agency.month2.normalRate.toFixed(1)}%`) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center hidden sm:table-cell">
                        {agency.month3.normalRate ? (agency.month3.normalRate === 100 ? '100%' : agency.month3.normalRate === 0 ? '0%' : `${agency.month3.normalRate.toFixed(1)}%`) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {avgRate ? (avgRate === 100 ? '100%' : avgRate === 0 ? '0%' : `${avgRate.toFixed(1)}%`) : 'N/A'}
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
  );
}
