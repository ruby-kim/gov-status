'use client';

import { useState } from 'react';
import { AlertCircle, Bug, Info, Mail, ExternalLink, CheckCircle, Github } from 'lucide-react';
import { GITHUB_CONFIG } from '@/constants/config';
import PageJsonLd from '@/components/PageJsonLd';

export default function ReportContent() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reportTypes = [
    {
      id: 'incorrect-info',
      title: '잘못된 정보',
      description: '서비스명, 기관명, URL 등이 잘못되었습니다',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      formUrl: 'https://forms.gle/HRa1tiDwTXutuAPG8'
    },
    {
      id: 'missing-service',
      title: '누락된 서비스',
      description: '목록에 없는 정부 서비스가 있습니다',
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      formUrl: 'https://forms.gle/q11WXgBAKNZKFAQG7'
    },
    {
      id: 'technical-issue',
      title: '기술적 문제',
      description: '사이트 접속 오류, 기능 오작동 등',
      icon: Bug,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      formUrl: 'https://forms.gle/CqNadnxLDdYpn3kc8'
    },
    {
      id: 'other',
      title: '기타',
      description: '기타 의견이나 제안사항',
      icon: Mail,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      formUrl: 'https://forms.gle/YZEFkNQJugsmPQUUA'
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setIsSubmitted(false);
  };

  const handleSubmit = () => {
    // 선택된 제보 유형에 맞는 구글 폼으로 리다이렉트
    const selectedReportType = reportTypes.find(type => type.id === selectedType);
    if (selectedReportType?.formUrl) {
      window.open(selectedReportType.formUrl, '_blank');
      setIsSubmitted(true);
    }
  };

  return (
    <>
      <PageJsonLd page="report" />
      <div className="space-y-8 pt-20">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">정보 제보</h1>
        <p className="mt-2 text-gray-600">
          잘못된 정보나 누락된 서비스를 발견하셨나요?<br />
          여러분의 제보가 더 정확한 서비스를 만드는 데 도움이 됩니다.
        </p>
      </div>

      {/* 제보 유형 선택 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">제보 유형을 선택해주세요</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? `${type.bgColor} ${type.borderColor} ${type.color}`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`w-6 h-6 mt-1 ${isSelected ? type.color : 'text-gray-400'}`} />
                  <div>
                    <h3 className={`font-semibold ${isSelected ? type.color : 'text-gray-900'}`}>
                      {type.title}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'opacity-80' : 'text-gray-600'}`}>
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 유형에 따른 안내 */}
      {selectedType && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {reportTypes.find(t => t.id === selectedType)?.title} 제보
            </h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              선택하신 제보 유형에 맞는 구글 폼으로 이동합니다. 
              가능한 한 자세한 정보를 제공해주시면 더 빠르게 처리할 수 있습니다.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">제보 시 포함해주세요:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {selectedType === 'incorrect-info' && (
                  <>
                    <li>• 잘못된 정보가 있는 서비스명</li>
                    <li>• 올바른 정보</li>
                    <li>• 정보 출처</li>
                  </>
                )}
                {selectedType === 'missing-service' && (
                  <>
                    <li>• 누락된 서비스명</li>
                    <li>• 서비스 URL</li>
                    <li>• 소속 기관</li>
                    <li>• 서비스 설명</li>
                  </>
                )}
                {selectedType === 'technical-issue' && (
                  <>
                    <li>• 문제가 발생한 페이지</li>
                    <li>• 오류 메시지 (있다면)</li>
                    <li>• 사용 중인 브라우저</li>
                    <li>• 문제 재현 방법</li>
                  </>
                )}
                {selectedType === 'other' && (
                  <>
                    <li>• 구체적인 의견이나 제안</li>
                    <li>• 개선하고 싶은 부분</li>
                    <li>• 추가 기능 요청</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>구글 폼으로 제보하기</span>
              </button>
              
              <a
                href={GITHUB_CONFIG.REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub에서 기여하기</span>
              </a>
              
              <button
                onClick={() => setSelectedType('')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                다시 선택
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 제출 완료 메시지 */}
      {isSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">제보가 접수되었습니다!</h3>
              <p className="text-green-700 mt-1">
                소중한 제보 감사합니다. 검토 후 반영하겠습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 추가 안내 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">제보 안내</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 제보해주신 정보는 검토 후 서비스 개선에 활용됩니다.</p>
            <p>• 개인정보는 제보 처리 목적으로만 사용되며, 제3자에게 제공되지 않습니다.</p>
            <p>• 제보 처리 결과는 개별적으로 연락드리지 않을 수 있습니다.</p>
            <p>• 긴급한 문제나 민원은 해당 기관에 직접 문의하시기 바랍니다.</p>
            <p className="text-blue-600 font-semibold">• 원하시는 경우, 기여자 명단에 이름(또는 닉네임)을 올려드립니다.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">개발자 기여</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              개발자이시라면 GitHub에서 직접 코드에 기여하실 수 있습니다.
            </p>
            <div className="space-y-2">
              <a
                href={GITHUB_CONFIG.REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub 저장소 방문</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• 버그 수정 및 기능 개선</p>
                <p>• 새로운 정부 서비스 추가</p>
                <p>• UI/UX 개선 제안</p>
                <p>• 문서화 및 번역</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
