import { Metadata } from 'next';
import WebAppJsonLd from '@/components/WebAppJsonLd';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '정부 사이트 장애 현황 모니터링 서비스의 개인정보처리방침입니다. 개인정보 수집, 이용, 보관에 대한 정책을 확인하세요.',
  openGraph: {
    title: '개인정보처리방침',
    description: '정부 사이트 장애 현황 모니터링 서비스의 개인정보처리방침입니다.',
  },
  twitter: {
    title: '개인정보처리방침',
    description: '정부 사이트 장애 현황 모니터링 서비스의 개인정보처리방침입니다.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <WebAppJsonLd
        name="개인정보처리방침 - 정부 사이트 장애 현황"
        description="정부 사이트 장애 현황 모니터링 서비스의 개인정보처리방침입니다."
        url="https://gov-status.vercel.app/privacy"
        applicationCategory="GovernmentApplication"
        operatingSystem="Any"
        author={{
          name: "김루비",
          url: "https://anb-network.com"
        }}
        faq={[
          {
            question: "어떤 개인정보를 수집하나요?",
            answer: "저희 서비스는 개인정보를 수집하지 않습니다. Vercel Analytics와 Google Analytics를 통해 익명화된 사용 통계만 수집합니다."
          },
          {
            question: "수집된 데이터는 어떻게 사용되나요?",
            answer: "익명화된 사용 통계는 서비스 개선 목적으로만 사용되며, 개인을 식별할 수 있는 정보는 포함되지 않습니다."
          },
          {
            question: "데이터를 제3자와 공유하나요?",
            answer: "아니요, 수집된 익명화된 통계 데이터는 제3자와 공유하지 않습니다."
          }
        ]}
        breadcrumb={[
          { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
          { name: "개인정보처리방침", url: "https://gov-status.vercel.app/privacy", position: 2 }
        ]}
      />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>최종 업데이트:</strong> 2025년 10월 1일
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 개인정보 수집 및 이용</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800 font-medium">
                🛡️ 저희 서비스는 개인정보를 수집하지 않습니다.
              </p>
            </div>
            <p className="text-gray-700 mb-4">
              정부 사이트 장애 현황 모니터링 서비스(&quot;서비스&quot;)는 개인정보를 수집하지 않습니다. 
              서비스는 정부 기관의 공개된 웹사이트 상태만 모니터링하며, 개인을 식별할 수 있는 정보는 처리하지 않습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 익명화된 사용 통계</h2>
            <p className="text-gray-700 mb-4">
              서비스 개선을 위해 다음과 같은 익명화된 통계 정보만 수집합니다:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>페이지 방문 횟수 및 경로</li>
              <li>사용자 기기 정보 (브라우저, 운영체제 등)</li>
              <li>서비스 성능 지표 (로딩 시간, 오류율 등)</li>
              <li>지역별 접속 통계 (국가/도시 수준)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              이러한 정보는 개인을 식별할 수 없으며, 서비스 개선 목적으로만 사용됩니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 분석 도구</h2>
            <p className="text-gray-700 mb-4">
              서비스에서는 다음 분석 도구를 사용합니다:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Vercel Analytics</h3>
              <p className="text-gray-700 text-sm mb-2">
                - 개인정보를 수집하지 않는 프라이버시 친화적 분석 도구
              </p>
              <p className="text-gray-700 text-sm">
                - 쿠키를 사용하지 않으며, GDPR을 준수합니다
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Google Analytics 4</h3>
              <p className="text-gray-700 text-sm mb-2">
                - 익명화된 사용 통계 수집
              </p>
              <p className="text-gray-700 text-sm">
                - IP 주소 익명화 처리 적용
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 기여자 정보</h2>
            <p className="text-gray-700 mb-4">
              오픈소스 프로젝트에 기여하시는 경우, 다음 정보가 공개될 수 있습니다:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>GitHub 사용자명 또는 닉네임</li>
              <li>기여 내용 (코드, 문서, 번역 등)</li>
              <li>기여 날짜</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-800">
                <strong>선택적 공개:</strong> 기여자 정보는 선택적으로 공개되며, 
                기여자가 원하지 않는 경우 기여자 목록에서 제외될 수 있습니다.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 데이터 보관 및 삭제</h2>
            <p className="text-gray-700 mb-4">
              - 익명화된 통계 데이터는 서비스 운영 기간 동안 보관됩니다
            </p>
            <p className="text-gray-700 mb-4">
              - 기여자 정보는 프로젝트가 종료되거나 기여자가 요청할 경우 삭제됩니다
            </p>
            <p className="text-gray-700 mb-4">
              - 개인정보는 수집하지 않으므로 별도의 삭제 절차가 없습니다
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 제3자 공유</h2>
            <p className="text-gray-700 mb-4">
              저희는 수집된 익명화된 통계 데이터를 제3자와 공유하지 않습니다. 
              다만, 다음의 경우는 예외입니다:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>법적 요구사항이 있는 경우</li>
              <li>서비스 제공을 위해 필요한 최소한의 정보만 제공하는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 연락처</h2>
            <p className="text-gray-700 mb-4">
              개인정보처리방침에 대한 문의사항이 있으시면 다음으로 연락해 주세요:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>이메일:</strong> govstatus@anb-network.com
              </p>
              <p className="text-gray-700">
                <strong>개발자:</strong> 김루비 (A&B Network)
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 정책 변경</h2>
            <p className="text-gray-700 mb-4">
              이 개인정보처리방침은 필요에 따라 변경될 수 있습니다. 
              중요한 변경사항이 있을 경우 서비스 내 공지사항을 통해 알려드리겠습니다.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
