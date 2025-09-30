import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '정부 사이트 장애 현황 모니터링',
  description: '정부 서비스들의 상태를 모니터링하고 분석하는 대시보드 (10분마다 업데이트)',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20 flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center text-sm text-gray-600 space-y-2">
                <p>© {currentYear} 정부 사이트 장애 현황 모니터링 by <a href="https://anb-network.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 hover:underline">김루비</a>. All rights reserved.</p>
                <p>
                  Contact: <a href="mailto:govstatus@anb-network.com" className="text-gray-700 hover:text-gray-900 hover:underline">govstatus@anb-network.com</a>
                </p>
                <p className="text-xs text-gray-500">
                  이 서비스는 정부 기관의 공식 웹사이트가 아니며, 오픈소스 프로젝트 및 포트폴리오 일환으로 제작되었습니다.
                </p>
              </div>
            </div>
          </footer>
          <ScrollToTop />
        </div>
      </body>
    </html>
  );
}