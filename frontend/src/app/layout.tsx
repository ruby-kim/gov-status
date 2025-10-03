import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import NoticeBanner from '@/components/NoticeBanner';
import ScrollToTop from '@/components/ScrollToTop';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: '정부서비스 장애 현황',
    template: '%s | 정부서비스 장애 현황'
  },
  description: '정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다. 10분마다 최신 데이터로 업데이트.',
  keywords: ['정부사이트', '장애현황', '모니터링', '정부24', '공공서비스', '접속오류', '실시간'],
  authors: [{ name: '김루비', url: 'https://anb-network.com' }],
  creator: '김루비',
  publisher: 'A&B Network',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gov-status.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '정부 사이트 장애 현황',
    description: '정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다. 10분마다 최신 데이터로 업데이트.',
    url: 'https://gov-status.vercel.app',
    siteName: '정부 사이트 장애 현황 모니터링',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '정부 사이트 장애 현황 모니터링',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '정부 사이트 장애 현황',
    description: '정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다.',
    images: ['/og-image.png'],
    creator: '@anb_network',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: '4vZm2AHqQ4NzjmZFA5TQz3JXM4NNdrRPLoPHxFxzKUk',
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
      <head>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-V1CRVHSMCW"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-V1CRVHSMCW');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <NoticeBanner />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center text-sm text-gray-600 space-y-2">
                <p>© {currentYear} 정부 사이트 장애 현황 모니터링 by <a href="https://anb-network.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 hover:underline">김루비</a>. All rights reserved.</p>
                <p>
                  Contact: <a href="mailto:govstatus@anb-network.com" className="text-gray-700 hover:text-gray-900 hover:underline">govstatus@anb-network.com</a>
                </p>
                <div className="flex justify-center space-x-4 text-xs">
                  <a href="/privacy" className="text-gray-500 hover:text-gray-700 hover:underline">개인정보처리방침</a>
                  <a href="/terms" className="text-gray-500 hover:text-gray-700 hover:underline">이용약관</a>
                </div>
                <p className="text-sm text-gray-500">
                  이 서비스는 정부 기관의 공식 웹사이트가 아니며, 오픈소스 프로젝트 및 포트폴리오 일환으로 제작되었습니다.
                </p>
              </div>
            </div>
          </footer>
          <ScrollToTop />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </div>
      </body>
    </html>
  );
}