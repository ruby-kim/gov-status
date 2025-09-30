import { Metadata } from 'next';
import WebAppJsonLd from '@/components/WebAppJsonLd';

export const metadata: Metadata = {
  title: '이용약관',
  description: '정부 사이트 장애 현황 모니터링 서비스의 이용약관입니다. 서비스 이용 조건과 제한사항을 확인하세요.',
  openGraph: {
    title: '이용약관',
    description: '정부 사이트 장애 현황 모니터링 서비스의 이용약관입니다.',
  },
  twitter: {
    title: '이용약관',
    description: '정부 사이트 장애 현황 모니터링 서비스의 이용약관입니다.',
  },
};

export default function TermsOfUsePage() {
  return (
    <>
      <WebAppJsonLd
        name="이용약관 - 정부 사이트 장애 현황"
        description="정부 사이트 장애 현황 모니터링 서비스의 이용약관입니다."
        url="https://gov-status.vercel.app/terms"
        applicationCategory="GovernmentApplication"
        operatingSystem="Any"
        author={{
          name: "김루비",
          url: "https://anb-network.com"
        }}
        faq={[
          {
            question: "이 서비스는 무료인가요?",
            answer: "네, 이 서비스는 완전히 무료로 제공됩니다. 개인정보도 수집하지 않습니다."
          },
          {
            question: "서비스의 정확성은 보장되나요?",
            answer: "서비스는 10분마다 자동으로 업데이트되지만, 실시간 정확성을 100% 보장하지는 않습니다. 참고용으로만 사용해 주세요."
          },
          {
            question: "상업적 이용이 가능한가요?",
            answer: "MIT 라이선스 하에 제공되므로 상업적 이용이 가능합니다. 단, 서비스의 정확성에 대한 책임은 이용자에게 있습니다."
          }
        ]}
        breadcrumb={[
          { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
          { name: "이용약관", url: "https://gov-status.vercel.app/terms", position: 2 }
        ]}
      />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>최종 업데이트:</strong> 2025년 10월 1일
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 서비스 소개</h2>
            <p className="text-gray-700 mb-4">
              정부 사이트 장애 현황 모니터링 서비스(&quot;서비스&quot;)는 정부 기관의 공개된 웹사이트 상태를 
              모니터링하고 시각화하여 제공하는 무료 서비스입니다.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800 font-medium">
                ⚠️ 이 서비스는 정부 기관의 공식 서비스가 아닙니다.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 서비스 이용 조건</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 무료 이용</h3>
            <p className="text-gray-700 mb-4">
              본 서비스는 완전히 무료로 제공되며, 별도의 가입 절차 없이 이용할 수 있습니다.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 이용 제한</h3>
            <p className="text-gray-700 mb-4">다음 행위는 금지됩니다:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>자동화된 도구를 이용한 과도한 요청</li>
              <li>서비스의 보안을 위협하는 행위</li>
              <li>다른 이용자의 서비스 이용을 방해하는 행위</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 서비스의 정확성</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                ⚠️ 서비스의 정확성을 100% 보장하지 않습니다.
              </p>
            </div>
            <p className="text-gray-700 mb-4">
              - 서비스는 10분마다 자동으로 업데이트되지만, 실시간 정확성을 보장하지 않습니다
            </p>
            <p className="text-gray-700 mb-4">
              - 네트워크 상태, 서버 점검, 일시적 장애 등으로 인해 부정확한 정보가 표시될 수 있습니다
            </p>
            <p className="text-gray-700 mb-4">
              - 중요한 업무에 사용하기 전에 해당 기관의 공식 채널을 확인하시기 바랍니다
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 책임 제한</h2>
            <p className="text-gray-700 mb-4">
              서비스 제공자는 다음에 대해 책임지지 않습니다:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>서비스의 정확성, 완전성, 신뢰성</li>
              <li>서비스 이용으로 인한 직접적 또는 간접적 손해</li>
              <li>서비스 중단, 지연, 오류로 인한 손해</li>
              <li>제3자의 행위로 인한 손해</li>
              <li>서비스 정보를 근거로 한 의사결정으로 인한 손해</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 지적재산권</h2>
            <p className="text-gray-700 mb-4">
              - 서비스의 소스코드는 MIT 라이선스 하에 제공됩니다
            </p>
            <p className="text-gray-700 mb-4">
              - 정부 기관의 로고, 상표 등은 해당 기관의 소유입니다
            </p>
            <p className="text-gray-700 mb-4">
              - 서비스의 디자인, UI/UX는 저작권법의 보호를 받습니다
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 서비스 변경 및 중단</h2>
            <p className="text-gray-700 mb-4">
              서비스 제공자는 다음의 경우 서비스를 변경하거나 중단할 수 있습니다:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>기술적 문제로 인한 경우</li>
              <li>법적 요구사항으로 인한 경우</li>
              <li>서비스 개선을 위한 경우</li>
              <li>기타 불가피한 사유가 있는 경우</li>
            </ul>
            <p className="text-gray-700 mb-4">
              서비스 중단 시 사전 공지하되, 긴급한 경우 사후 공지할 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 개인정보 보호</h2>
            <p className="text-gray-700 mb-4">
              서비스는 개인정보를 수집하지 않습니다. 자세한 내용은 {" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">개인정보처리방침</a>을 
              참조하시기 바랍니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 기여 및 피드백</h2>
            <p className="text-gray-700 mb-4">
              서비스 개선을 위한 기여와 피드백을 환영합니다:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>버그 신고 및 개선 제안</li>
              <li>새로운 정부 서비스 정보 제공</li>
              <li>코드 기여 (GitHub Pull Request)</li>
              <li>문서화 및 번역</li>
            </ul>
            <p className="text-gray-700 mb-4">
              기여자 정보는 선택적으로 공개될 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. 준거법 및 관할</h2>
            <p className="text-gray-700 mb-4">
              본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련된 분쟁은 
              대한민국 법원의 관할에 따릅니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. 연락처</h2>
            <p className="text-gray-700 mb-4">
              서비스 이용과 관련된 문의사항이 있으시면 다음으로 연락해 주세요:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>이메일:</strong> govstatus@anb-network.com
              </p>
              <p className="text-gray-700">
                <strong>개발자:</strong> 김루비 (A&B Network)
              </p>
              <p className="text-gray-700">
                <strong>GitHub:</strong> 
                <a href="https://github.com/anb-network/gov-status" 
                   className="text-blue-600 hover:text-blue-800 underline ml-1">
                  github.com/anb-network/gov-status
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. 약관 변경</h2>
            <p className="text-gray-700 mb-4">
              본 약관은 필요에 따라 변경될 수 있습니다. 중요한 변경사항이 있을 경우 
              서비스 내 공지사항을 통해 알려드리겠습니다.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
