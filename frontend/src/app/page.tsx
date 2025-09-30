import { Metadata } from 'next';
import DashboardContent from '@/app/DashboardContent';

export const metadata: Metadata = {
  title: '정부서비스 장애 현황',
  description: '정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다. 10분마다 최신 데이터로 업데이트.',
  openGraph: {
    title: '정부서비스 장애 현황',
    description: '정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다. 10분마다 최신 데이터로 업데이트.',
  },
  twitter: {
    title: '정부서비스 장애 현황',
    description: '정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다. 10분마다 최신 데이터로 업데이트.',
  },
};

export default function Dashboard() {
  return <DashboardContent />;
}