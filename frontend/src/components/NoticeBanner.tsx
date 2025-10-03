'use client';

import { usePathname } from 'next/navigation';
import { Info } from 'lucide-react';

export default function NoticeBanner() {
  const pathname = usePathname();

  const hiddenPaths = ['/notices', '/report', '/contributors'];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }
  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-blue-50 border-b border-blue-200 py-2 md:py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 md:gap-4 lg:gap-6 text-xs md:text-sm px-2 md:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 md:gap-2">
          <Info className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0 text-blue-600" />
          <span className="font-medium text-blue-800">
            <span className="hidden md:inline">정부의 공식 발표 및 전체 리스트는 행정안전부의 공지사항을 확인하시기 바랍니다.</span>
            <span className="md:hidden">정부 공식 발표는 행정안전부 공지사항을 확인하세요.</span>
          </span>
        </div>
        <a
          href="/notices"
          className="inline-flex items-center gap-1 px-2 py-1 md:px-3 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs md:text-sm font-medium transition-colors"
        >
          자세히보기
        </a>
      </div>
    </div>
  );
}
