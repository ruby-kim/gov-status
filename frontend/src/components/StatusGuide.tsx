'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Wrench, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface StatusGuideProps {
  className?: string;
}

export default function StatusGuide({ className = '' }: StatusGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = [
    {
      status: 'normal',
      icon: CheckCircle,
      title: '정상',
      description: '서비스가 정상적으로 작동하고 있습니다',
      criteria: [
        '웹사이트 접속 가능',
        '모든 기능 정상 작동',
        '느려도 작동하면 정상',
        '오류 없음'
      ],
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      status: 'maintenance',
      icon: Wrench,
      title: '점검중',
      description: '계획된 점검으로 일시적으로 서비스가 중단되었습니다',
      criteria: [
        '사전 공지된 점검',
        '서버실에서 의도적 중단',
        '점검 완료 후 정상화 예정',
        '점검 시간 안내 제공'
      ],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      status: 'problem',
      icon: XCircle,
      title: '문제',
      description: '서비스에 접속할 수 없습니다',
      criteria: [
        '웹사이트 접속 불가',
        '연결 시간 초과',
        '서버 오류 발생',
        '예상치 못한 장애'
      ],
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">서비스 상태 기준 안내</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Info className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">서비스 상태 판정 기준</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  각 서비스의 상태는 <span className="font-medium text-gray-900">웹사이트 접속 가능 여부</span>, 
                  <span className="font-medium text-gray-900"> 응답 시간</span>, 
                  <span className="font-medium text-gray-900"> 오류 발생 여부</span>를 
                  종합적으로 판단하여 결정됩니다.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.status}
                  className={`p-5 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${info.bgColor} ${info.borderColor}`}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-2 ${info.bgColor}`}>
                      <Icon className={`w-7 h-7 ${info.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-lg font-bold ${info.color} mb-1`}>{info.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{info.description}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800 mb-3">
                      판정 기준
                    </p>
                    <ul className="space-y-2">
                      {info.criteria.map((criterion, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start space-x-3">
                          <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-gray-400"></span>
                          <span className="leading-relaxed">{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">ℹ</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-1">안내사항</h5>
                <p className="text-sm text-gray-700 leading-relaxed">
                  서비스 상태는 <span className="font-medium text-gray-900">10분마다 자동으로 확인</span>되며, 
                  실제 상황과 다를 수 있습니다. 정확한 정보는 
                  <span className="font-medium text-gray-900"> 해당 기관에 직접 문의</span>하시기 바랍니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
