'use client';

import { useState } from 'react';
import { ExternalLink, AlertCircle, Bell, Info } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/constants/config';

export default function NoticesPage() {
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="h-8 w-8 mr-3 text-blue-600" />
            공지사항
          </h1>
          <p className="mt-2 text-gray-600">
            국가정보자원관리원 화재 관련 정부기관 서비스 현황 공지사항입니다.
          </p>
        </div>
      </div>

      {/* 데스크톱: iframe 영역 */}
      <div className="hidden md:block flex-1 overflow-x-auto">
        {!iframeError ? (
          <div className="relative h-screen min-w-[1200px]">
            <iframe
              src={EXTERNAL_LINKS.NAVER_NOTICE}
              width="100%"
              height="100%"
              allowFullScreen
              onError={handleIframeError}
              className="w-full h-full border-0 min-w-[1200px]"
              style={{ minWidth: '1200px' }}
              title="네이버 공지사항"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                iframe 로드 실패
              </h3>
              <p className="text-gray-500 mb-6">
                보안 정책으로 인해 iframe으로 표시할 수 없습니다.
              </p>
              <a
                href={EXTERNAL_LINKS.NAVER_NOTICE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                네이버 공지사항에서 보기
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 모바일: 모바일용 iframe */}
      <div className="md:hidden flex-1">
        {!iframeError ? (
          <div className="relative h-[80vh]">
            <iframe
              src={EXTERNAL_LINKS.NAVER_NOTICE}
              width="100%"
              height="100%"
              allowFullScreen
              onError={handleIframeError}
              className="w-full h-full border-0"
              title="네이버 공지사항 (모바일)"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[80vh] bg-gray-50 p-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                iframe 로드 실패
              </h3>
              <p className="text-gray-500 mb-6">
                보안 정책으로 인해 iframe으로 표시할 수 없습니다.
              </p>
              <a
                href={EXTERNAL_LINKS.NAVER_NOTICE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                네이버 공지사항에서 보기
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
