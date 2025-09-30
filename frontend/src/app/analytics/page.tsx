import { Metadata } from 'next';
import AnalyticsContent from './AnalyticsContent';

export const metadata: Metadata = {
  title: '통계',
  description: '정부 서비스의 상세한 분석 데이터를 확인하세요. 기관별 정상율, 시간대별 트렌드, 서비스 상태 분포 등을 실시간으로 모니터링합니다.',
  openGraph: {
    title: '통계',
    description: '정부 서비스의 상세한 분석 데이터를 확인하세요. 기관별 정상율, 시간대별 트렌드, 서비스 상태 분포 등을 실시간으로 모니터링합니다.',
  },
  twitter: {
    title: '통계',
    description: '정부 서비스의 상세한 분석 데이터를 확인하세요. 기관별 정상율, 시간대별 트렌드, 서비스 상태 분포 등을 실시간으로 모니터링합니다.',
  },
};

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}