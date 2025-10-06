'use client';

import { Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  lastUpdated?: string | Date | null;
}

export default function Header({ title, description, lastUpdated }: HeaderProps) {
  const formattedTime = lastUpdated ? new Date(lastUpdated).toLocaleString('ko-KR') : '로딩 중...';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      {/* 왼쪽: 제목 + 설명 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-2 text-gray-600">{description}</p>}
      </div>

      {/* 오른쪽: 업데이트 정보 */}
      <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-500">
        <Activity className="w-4 h-4 text-blue-500" />
        <span>마지막 업데이트: {formattedTime}</span>
      </div>
    </div>
  );
}
