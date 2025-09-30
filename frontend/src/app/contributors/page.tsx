import { Metadata } from 'next';
import ContributorsContent from './ContributorsContent';

export const metadata: Metadata = {
  title: '기여자',
  description: '정부서비스 장애 현황 모니터링 프로젝트에 기여한 멋진 기여자들을 소개합니다. 오픈소스 프로젝트에 참여해보세요.',
  openGraph: {
    title: '기여자',
    description: '정부서비스 장애 현황 모니터링 프로젝트에 기여한 멋진 기여자들을 소개합니다. 오픈소스 프로젝트에 참여해보세요.',
  },
  twitter: {
    title: '기여자',
    description: '정부서비스 장애 현황 모니터링 프로젝트에 기여한 멋진 기여자들을 소개합니다. 오픈소스 프로젝트에 참여해보세요.',
  },
};

export default function ContributorsPage() {
  return <ContributorsContent />;
}