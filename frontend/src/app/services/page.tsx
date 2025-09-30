import { Metadata } from 'next';
import ServicesContent from './ServicesContent';

export const metadata: Metadata = {
  title: '서비스 현황',
  description: '모든 정부 서비스의 실시간 상태를 확인하세요. 검색, 필터링, 정렬 기능으로 원하는 서비스를 쉽게 찾을 수 있습니다.',
  openGraph: {
    title: '서비스 현황',
    description: '모든 정부 서비스의 실시간 상태를 확인하세요. 검색, 필터링, 정렬 기능으로 원하는 서비스를 쉽게 찾을 수 있습니다.',
  },
  twitter: {
    title: '서비스 현황',
    description: '모든 정부 서비스의 실시간 상태를 확인하세요. 검색, 필터링, 정렬 기능으로 원하는 서비스를 쉽게 찾을 수 있습니다.',
  },
};

export default function ServicesPage() {
  return <ServicesContent />;
}
