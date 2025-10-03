import { Metadata } from 'next';
import ReportContent from './ReportContent';

export const metadata: Metadata = {
  title: '정보 제보',
  description: '잘못된 정보나 누락된 서비스를 발견하셨나요? 여러분의 제보가 더 정확한 서비스를 만드는 데 도움이 됩니다.',
  openGraph: {
    title: '정보 제보',
    description: '잘못된 정보나 누락된 서비스를 발견하셨나요? 여러분의 제보가 더 정확한 서비스를 만드는 데 도움이 됩니다.',
    images: ['/og-image.png'],
  },
  twitter: {
    title: '정보 제보',
    description: '잘못된 정보나 누락된 서비스를 발견하셨나요? 여러분의 제보가 더 정확한 서비스를 만드는 데 도움이 됩니다.',
    images: ['/og-image.png'],
  },
};

export default function ReportPage() {
  return <ReportContent />;
}
