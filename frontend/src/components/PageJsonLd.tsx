'use client';

import WebAppJsonLd from './WebAppJsonLd';

type PageType = 'home' | 'analytics' | 'services' | 'report' | 'contributors' | 'terms' | 'privacy';

interface PageJsonLdProps {
  page: PageType;
}

const pageConfigs = {
  home: {
    name: "정부 사이트 장애 현황",
    description: "정부24, 공공서비스 등 주요 정부 사이트의 접속 오류와 장애 현황을 실시간으로 모니터링합니다. 10분마다 최신 데이터로 업데이트.",
    url: "https://gov-status.vercel.app",
    faq: [
      {
        question: "서비스 상태는 얼마나 자주 업데이트되나요?",
        answer: "10분마다 자동으로 업데이트됩니다. 실시간에 가까운 최신 상태를 확인할 수 있습니다."
      },
      {
        question: "어떤 정부 서비스들을 모니터링하나요?",
        answer: "정부24, 공공서비스, 각 부처별 주요 웹사이트와 온라인 서비스를 모니터링합니다. 총 100개 이상의 정부 서비스를 대상으로 합니다."
      },
      {
        question: "서비스 상태는 어떻게 분류되나요?",
        answer: "정상(녹색), 점검중(파란색), 문제(빨간색) 3가지 상태로 분류됩니다. 각 상태는 서비스의 접속 가능 여부와 응답 시간을 기준으로 판단합니다."
      },
      {
        question: "장애가 발생했을 때 어떻게 알 수 있나요?",
        answer: "대시보드에서 빨간색으로 표시되며, 상세 페이지에서 구체적인 장애 원인과 복구 시간을 확인할 수 있습니다."
      },
      {
        question: "모바일에서도 사용할 수 있나요?",
        answer: "네, 반응형 웹 디자인으로 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 화면으로 이용할 수 있습니다."
      },
      {
        question: "데이터는 얼마나 오래 보관되나요?",
        answer: "1개월간의 상세 데이터를 보관하며, 장기 트렌드 분석을 통해 서비스 안정성 개선에 활용할 수 있습니다."
      },
      {
        question: "개인정보가 수집되나요?",
        answer: "아니요, 서비스 접속 상태만 모니터링하며 개인정보는 수집하지 않습니다. 공개된 웹사이트의 접속 가능 여부만 확인합니다."
      },
      {
        question: "API를 통해 데이터를 가져올 수 있나요?",
        answer: "네, RESTful API를 제공합니다. /api/stats, /api/dashboard, /api/history 엔드포인트를 통해 JSON 형태로 데이터를 조회할 수 있습니다."
      }
    ],
    breadcrumb: [
      { name: "홈", url: "https://gov-status.vercel.app", position: 1 }
    ]
  },
  analytics: {
    name: "서비스 분석 - 정부 사이트 장애 현황",
    description: "정부 서비스의 상세한 분석 데이터를 확인하세요. 기관별 정상율, 시간대별 트렌드, 서비스 상태 분포 등을 실시간으로 모니터링합니다.",
    url: "https://gov-status.vercel.app/analytics",
    faq: [
      {
        question: "기관별 정상율은 어떻게 계산되나요?",
        answer: "각 기관의 서비스 중 정상 작동하는 서비스의 비율을 백분율로 표시합니다. 1개월간의 평균값과 현재값을 비교할 수 있습니다."
      },
      {
        question: "시간대별 트렌드는 어떤 데이터를 보여주나요?",
        answer: "최근 7시간 동안의 전체 서비스 정상율 변화를 시간대별로 표시합니다. 서비스 이용 패턴을 파악할 수 있습니다."
      },
      {
        question: "1개월 데이터는 어떻게 활용할 수 있나요?",
        answer: "장기적인 서비스 안정성 트렌드를 파악하고, 개선이 필요한 기관을 식별하는 데 활용할 수 있습니다."
      }
    ],
    breadcrumb: [
      { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
      { name: "서비스 분석", url: "https://gov-status.vercel.app/analytics", position: 2 }
    ]
  },
  services: {
    name: "서비스 현황 - 정부 사이트 장애 현황",
    description: "모든 정부 서비스의 실시간 상태를 확인하세요. 검색, 필터링, 정렬 기능으로 원하는 서비스를 쉽게 찾을 수 있습니다.",
    url: "https://gov-status.vercel.app/services",
    faq: [
      {
        question: "서비스를 어떻게 검색할 수 있나요?",
        answer: "상단의 검색창에 서비스명이나 기관명을 입력하면 실시간으로 필터링됩니다. 정확한 이름을 모를 경우 부분 검색도 가능합니다."
      },
      {
        question: "필터링 기능은 어떻게 사용하나요?",
        answer: "상태별(정상/점검중/문제), 기관별, 응답시간별로 필터링할 수 있습니다. 여러 필터를 동시에 적용하여 원하는 서비스만 볼 수 있습니다."
      },
      {
        question: "정렬은 어떤 기준으로 할 수 있나요?",
        answer: "서비스명, 상태, 응답시간, 기관명 순으로 오름차순/내림차순 정렬이 가능합니다. 기본적으로 서비스명 순으로 정렬됩니다."
      },
      {
        question: "서비스 카드에서 어떤 정보를 확인할 수 있나요?",
        answer: "서비스명, 기관명, 현재 상태, 응답시간, 마지막 업데이트 시간을 확인할 수 있습니다. 클릭하면 상세 정보를 볼 수 있습니다."
      },
      {
        question: "그리드/리스트 보기는 어떻게 전환하나요?",
        answer: "우측 상단의 그리드/리스트 아이콘을 클릭하여 보기 방식을 전환할 수 있습니다. 그리드는 카드 형태, 리스트는 테이블 형태로 표시됩니다."
      }
    ],
    breadcrumb: [
      { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
      { name: "서비스 현황", url: "https://gov-status.vercel.app/services", position: 2 }
    ]
  },
  report: {
    name: "정보 제보 - 정부 사이트 장애 현황",
    description: "잘못된 정보나 누락된 서비스를 발견하셨나요? 여러분의 제보가 더 정확한 서비스를 만드는 데 도움이 됩니다.",
    url: "https://gov-status.vercel.app/report",
    faq: [
      {
        question: "어떤 종류의 정보를 제보할 수 있나요?",
        answer: "잘못된 서비스 정보, 누락된 서비스, 버그 신고, 기타 개선 사항을 제보할 수 있습니다. 각 카테고리별로 적절한 제보 방법을 안내합니다."
      },
      {
        question: "제보는 어떻게 처리되나요?",
        answer: "GitHub Issues를 통해 제보가 관리되며, 개발팀이 검토 후 적절한 조치를 취합니다. 제보 후 GitHub에서 진행 상황을 확인할 수 있습니다."
      },
      {
        question: "개인정보는 수집되나요?",
        answer: "제보 시 이메일 주소만 수집되며, 이는 제보 처리 및 피드백을 위해 사용됩니다. 다른 개인정보는 수집하지 않습니다."
      },
      {
        question: "제보 후 언제 반영되나요?",
        answer: "제보 내용에 따라 다르지만, 일반적으로 1-2주 내에 검토하고 반영합니다. 긴급한 경우 더 빠르게 처리될 수 있습니다."
      },
      {
        question: "GitHub 계정이 없어도 제보할 수 있나요?",
        answer: "네, 이메일을 통해서도 제보할 수 있습니다. 하지만 GitHub을 통한 제보가 더 빠르게 처리됩니다."
      }
    ],
    breadcrumb: [
      { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
      { name: "정보 제보", url: "https://gov-status.vercel.app/report", position: 2 }
    ]
  },
  contributors: {
    name: "기여자 - 정부 사이트 장애 현황",
    description: "정부서비스 장애 현황 모니터링 프로젝트에 기여한 멋진 기여자들을 소개합니다. 오픈소스 프로젝트에 참여해보세요.",
    url: "https://gov-status.vercel.app/contributors",
    faq: [
      {
        question: "어떻게 기여할 수 있나요?",
        answer: "코드 기여, 버그 신고, 문서화, 번역, 새로운 정부 서비스 추가 등 다양한 방법으로 기여할 수 있습니다. GitHub 저장소에서 이슈를 확인해보세요."
      },
      {
        question: "기여자로 등록되려면 어떻게 해야 하나요?",
        answer: "GitHub에서 Pull Request를 제출하고 승인되면 자동으로 기여자 목록에 추가됩니다. 코드 기여 외에도 이슈 제보나 문서화도 기여로 인정됩니다."
      },
      {
        question: "기술적 지식이 없어도 기여할 수 있나요?",
        answer: "네, 가능합니다. 문서화, 번역, 새로운 정부 서비스 정보 제공, 사용자 피드백 등 다양한 비기술적 기여 방법이 있습니다."
      },
      {
        question: "기여자 정보는 어떻게 관리되나요?",
        answer: "contributors.json 파일에서 관리되며, GitHub 프로필 정보를 기반으로 자동으로 업데이트됩니다. 개인정보는 최소한으로 수집합니다."
      },
      {
        question: "프로젝트의 목표는 무엇인가요?",
        answer: "정부 서비스의 투명성과 신뢰성을 높이고, 시민들이 정부 서비스 상태를 쉽게 확인할 수 있도록 하는 것이 목표입니다."
      }
    ],
    breadcrumb: [
      { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
      { name: "기여자", url: "https://gov-status.vercel.app/contributors", position: 2 }
    ]
  },
  terms: {
    name: "이용약관 - 정부 사이트 장애 현황",
    description: "정부 사이트 장애 현황 모니터링 서비스의 이용약관입니다.",
    url: "https://gov-status.vercel.app/terms",
    faq: [
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
    ],
    breadcrumb: [
      { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
      { name: "이용약관", url: "https://gov-status.vercel.app/terms", position: 2 }
    ]
  },
  privacy: {
    name: "개인정보처리방침 - 정부 사이트 장애 현황",
    description: "정부 사이트 장애 현황 모니터링 서비스의 개인정보처리방침입니다.",
    url: "https://gov-status.vercel.app/privacy",
    faq: [
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
    ],
    breadcrumb: [
      { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
      { name: "개인정보처리방침", url: "https://gov-status.vercel.app/privacy", position: 2 }
    ]
  }
};

export default function PageJsonLd({ page }: PageJsonLdProps) {
  const config = pageConfigs[page];
  
  if (!config) {
    console.warn(`Unknown page type: ${page}`);
    return null;
  }

  return (
    <WebAppJsonLd
      name={config.name}
      description={config.description}
      url={config.url}
      applicationCategory="GovernmentApplication"
      operatingSystem="Any"
      author={{
        name: "김루비",
        url: "https://anb-network.com"
      }}
      faq={config.faq}
      breadcrumb={config.breadcrumb}
    />
  );
}
