'use client';

import { useState, useEffect } from 'react';
import { ServiceStats } from '@/types/service';
import { loadDashboardData } from '@/utils/dataTransform';
import StatsOverview from '@/components/StatsOverview';
import StatusDistributionChart from '@/components/StatusDistributionChart';
import StatusGuide from '@/components/StatusGuide';
import WebAppJsonLd from '@/components/WebAppJsonLd';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { formatPercentage } from '@/utils/formatUtils';

export default function DashboardContent() {
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadDashboardData();
        setOverview(data.overview);
        setLastUpdated(new Date(data.lastUpdated || new Date()).toLocaleString('ko-KR'));
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

  // Context에서 통계 정보 가져오기
  const serviceStats: ServiceStats = overview ? {
    total: overview.totalServices,
    normal: overview.normalServices,
    maintenance: overview.maintenanceServices,
    problem: overview.problemServices,
    normalRate: overview.overallNormalRate
  } : {
    total: 0,
    normal: 0,
    maintenance: 0,
    problem: 0,
    normalRate: 0
  };


  return (
    <>
      <WebAppJsonLd
        name="정부 사이트 장애 현황"
        description="정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다. 10분마다 최신 데이터로 업데이트."
        url="https://gov-status.vercel.app"
        applicationCategory="GovernmentApplication"
        operatingSystem="Any"
        author={{
          name: "김루비",
          url: "https://anb-network.com"
        }}
        faq={[
          {
            question: "서비스 상태는 얼마나 자주 업데이트되나요?",
            answer: "10분마다 자동으로 업데이트됩니다. 실시간에 가까운 최신 상태를 확인할 수 있습니다."
          },
          {
            question: "어떤 정부 서비스들을 모니터링하나요?",
            answer: "정부24, 공공서비스, 각 부처별 주요 웹사이트와 온라인 서비스를 모니터링합니다. 총 100개 이상의 정부 서비스를 대상으로 합니다."
          },
          {
            question: "서비스 상태는 어떻게 분류되나요?",
            answer: "정상(녹색), 점검중(파란색), 문제(빨간색) 3가지 상태로 분류됩니다. 각 상태는 서비스의 접속 가능 여부와 응답 시간을 기준으로 판단합니다."
          },
          {
            question: "장애가 발생했을 때 어떻게 알 수 있나요?",
            answer: "대시보드에서 빨간색으로 표시되며, 상세 페이지에서 구체적인 장애 원인과 복구 시간을 확인할 수 있습니다."
          },
          {
            question: "모바일에서도 사용할 수 있나요?",
            answer: "네, 반응형 웹 디자인으로 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 화면으로 이용할 수 있습니다."
          },
          {
            question: "데이터는 얼마나 오래 보관되나요?",
            answer: "3개월간의 상세 데이터를 보관하며, 장기 트렌드 분석을 통해 서비스 안정성 개선에 활용할 수 있습니다."
          },
          {
            question: "개인정보가 수집되나요?",
            answer: "아니요, 서비스 접속 상태만 모니터링하며 개인정보는 수집하지 않습니다. 공개된 웹사이트의 접속 가능 여부만 확인합니다."
          },
          {
            question: "API를 통해 데이터를 가져올 수 있나요?",
            answer: "네, RESTful API를 제공합니다. /api/stats, /api/dashboard, /api/history 엔드포인트를 통해 JSON 형태로 데이터를 조회할 수 있습니다."
          }
        ]}
        breadcrumb={[
          { name: "홈", url: "https://gov-status.vercel.app", position: 1 }
        ]}
      />
      <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">정부 사이트 장애 현황 대시보드</h1>
          <p className="mt-2 text-gray-600">
            정부 서비스 모니터링 및 현황 분석 (10분마다 업데이트)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>마지막 업데이트: {lastUpdated || '로딩 중...'}</span>
          </div>
        </div>
      </div>

      {/* 전체 정상율 카드 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">전체 서비스 정상율</h2>
            <p className="text-blue-100 mt-1">
              {serviceStats.total.toLocaleString()}개 서비스 중 {serviceStats.normal.toLocaleString()}개 정상 운영
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{formatPercentage(serviceStats.normalRate)}</div>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm text-blue-100">전체 평균</span>
            </div>
          </div>
        </div>
      </div>

      {/* 상태별 통계 카드 */}
      <StatsOverview stats={serviceStats} />

      {/* 차트와 상세 보기 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatusDistributionChart stats={serviceStats} />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상태별 요약</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-900">정상 운영</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{serviceStats.normal}</div>
                <div className="text-sm text-green-600">{formatPercentage(serviceStats.normalRate)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-blue-900">점검중</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{serviceStats.maintenance}</div>
                <div className="text-sm text-blue-600">{formatPercentage(serviceStats.total > 0 ? (serviceStats.maintenance / serviceStats.total) * 100 : 0)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span className="font-medium text-red-900">문제</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{serviceStats.problem}</div>
                <div className="text-sm text-red-600">{formatPercentage(serviceStats.total > 0 ? (serviceStats.problem / serviceStats.total) * 100 : 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 보기 섹션 */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">더 자세한 정보를 확인하세요</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            각 서비스의 상세 상태, 기관별 통계, 모니터링 데이터를 확인할 수 있습니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/services"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">서비스 현황</h3>
              <p className="text-gray-600 mb-4">
                모든 정부 서비스의 상태를 확인하고 필터링할 수 있습니다.
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">
                {serviceStats.total}개 서비스 보기 →
              </div>
            </div>
          </a>

          <a
            href="/analytics"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">통계 분석</h3>
              <p className="text-gray-600 mb-4">
                기관별 통계, 트렌드 분석, 성능 지표를 확인할 수 있습니다.
              </p>
              <div className="text-green-600 font-medium group-hover:text-green-700">
                상세 분석 보기 →
              </div>
            </div>
          </a>

          <a
            href="/report"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <AlertCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">문제 제보</h3>
              <p className="text-gray-600 mb-4">
                서비스 문제를 발견하셨나요? 신고하고 개선에 기여해보세요.
              </p>
              <div className="text-purple-600 font-medium group-hover:text-purple-700">
                제보하기 →
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* 상태 기준 안내 */}
      <StatusGuide />
      </div>
    </>
  );
}
