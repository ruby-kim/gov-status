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
    <div className="bg-blue-50 border-b border-blue-200 relative py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 lg:gap-6 text-sm px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <span className="font-medium text-blue-800">
            정부의 공식 발표 및 전체 리스트는 행정안전부의 공지사항을 확인하시기 바랍니다.
          </span>
        </div>
        <a
          href="/notices"
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
        >
          자세히보기
        </a>
      </div>
    </div>
  );
}
