import { Service } from '@/types/service';

export const sampleServices: Service[] = [
  {
    id: '1',
    name: '정부24',
    url: 'https://www.gov.kr',
    status: 'normal',
    description: '정부 서비스 통합 포털',
    agency: {
      mainCategory: '중앙행정기관',
      subCategory: '행정안전부',
      name: '행정안전부'
    },
    lastChecked: new Date(),
    responseTime: 120,
    tags: ['포털', '통합서비스', '민원']
  },
  {
    id: '2',
    name: '국세청 홈택스',
    url: 'https://hometax.go.kr',
    status: 'normal',
    description: '국세청 전자세금계산서 및 신고납부 시스템',
    agency: {
      mainCategory: '중앙행정기관',
      subCategory: '기획재정부',
      name: '국세청'
    },
    lastChecked: new Date(),
    responseTime: 95,
    tags: ['세금', '신고', '전자계산서']
  },
  {
    id: '3',
    name: '건강보험공단',
    url: 'https://www.nhis.or.kr',
    status: 'normal',
    description: '건강보험 관련 서비스',
    agency: {
      mainCategory: '중앙행정기관',
      subCategory: '보건복지부',
      name: '건강보험공단'
    },
    lastChecked: new Date(),
    responseTime: 250,
    tags: ['건강보험', '의료', '보험']
  },
  {
    id: '4',
    name: '국민연금공단',
    url: 'https://www.nps.or.kr',
    status: 'normal',
    description: '국민연금 관련 서비스',
    agency: {
      mainCategory: '중앙행정기관',
      subCategory: '보건복지부',
      name: '국민연금공단'
    },
    lastChecked: new Date(),
    responseTime: 180,
    tags: ['연금', '노후', '보험']
  },
  {
    id: '5',
    name: '서울시청',
    url: 'https://www.seoul.go.kr',
    status: 'problem',
    description: '서울특별시 공식 홈페이지',
    agency: {
      mainCategory: '지방자치단체',
      subCategory: '서울특별시',
      name: '서울특별시'
    },
    lastChecked: new Date(),
    responseTime: 0,
    tags: ['지방자치', '서울', '시정']
  },
  {
    id: '6',
    name: '경기도청',
    url: 'https://www.gg.go.kr',
    status: 'maintenance',
    description: '경기도 공식 홈페이지',
    agency: {
      mainCategory: '지방자치단체',
      subCategory: '경기도',
      name: '경기도'
    },
    lastChecked: new Date(),
    responseTime: 0,
    tags: ['지방자치', '경기', '도정']
  },
  {
    id: '7',
    name: '인사혁신처',
    url: 'https://www.ipa.go.kr',
    status: 'normal',
    description: '공무원 인사관리 및 혁신 서비스',
    agency: {
      mainCategory: '중앙행정기관',
      subCategory: '인사혁신처',
      name: '인사혁신처'
    },
    lastChecked: new Date(),
    responseTime: 110,
    tags: ['공무원', '인사', '혁신']
  },
  {
    id: '8',
    name: '헌법재판소',
    url: 'https://www.ccourt.go.kr',
    status: 'normal',
    description: '헌법재판소 공식 홈페이지',
    agency: {
      mainCategory: '중앙행정기관',
      subCategory: '헌법상대통령자문기구',
      name: '헌법재판소'
    },
    lastChecked: new Date(),
    responseTime: 140,
    tags: ['헌법', '재판', '법원']
  },
  {
    id: '9',
    name: '국가정보원',
    url: 'https://www.nis.go.kr',
    status: 'normal',
    description: '국가정보원 공식 홈페이지',
    agency: {
      mainCategory: '중앙행정기관',
      subCategory: '국가정보원',
      name: '국가정보원'
    },
    lastChecked: new Date(),
    responseTime: 300,
    tags: ['정보', '보안', '국가']
  },
  {
    id: '10',
    name: '부산시청',
    url: 'https://www.busan.go.kr',
    status: 'normal',
    description: '부산광역시 공식 홈페이지',
    agency: {
      mainCategory: '지방자치단체',
      subCategory: '부산광역시',
      name: '부산광역시'
    },
    lastChecked: new Date(),
    responseTime: 160,
    tags: ['지방자치', '부산', '시정']
  }
];

// 더 많은 샘플 데이터를 생성하는 함수
export function generateMoreSampleData(): Service[] {
  const agencies = [
    { mainCategory: '중앙행정기관' as const, subCategory: '기획재정부', name: '기획재정부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '교육부', name: '교육부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '과학기술정보통신부', name: '과학기술정보통신부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '외교부', name: '외교부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '통일부', name: '통일부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '법무부', name: '법무부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '국방부', name: '국방부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '행정안전부', name: '행정안전부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '문화체육관광부', name: '문화체육관광부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '농림축산식품부', name: '농림축산식품부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '산업통상자원부', name: '산업통상자원부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '보건복지부', name: '보건복지부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '환경부', name: '환경부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '고용노동부', name: '고용노동부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '여성가족부', name: '여성가족부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '국토교통부', name: '국토교통부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '해양수산부', name: '해양수산부' },
    { mainCategory: '중앙행정기관' as const, subCategory: '중소벤처기업부', name: '중소벤처기업부' },
    { mainCategory: '지방자치단체' as const, subCategory: '서울특별시', name: '서울특별시' },
    { mainCategory: '지방자치단체' as const, subCategory: '부산광역시', name: '부산광역시' },
    { mainCategory: '지방자치단체' as const, subCategory: '대구광역시', name: '대구광역시' },
    { mainCategory: '지방자치단체' as const, subCategory: '인천광역시', name: '인천광역시' },
    { mainCategory: '지방자치단체' as const, subCategory: '광주광역시', name: '광주광역시' },
    { mainCategory: '지방자치단체' as const, subCategory: '대전광역시', name: '대전광역시' },
    { mainCategory: '지방자치단체' as const, subCategory: '울산광역시', name: '울산광역시' },
    { mainCategory: '지방자치단체' as const, subCategory: '세종특별자치시', name: '세종특별자치시' },
    { mainCategory: '지방자치단체' as const, subCategory: '경기도', name: '경기도' },
    { mainCategory: '지방자치단체' as const, subCategory: '강원도', name: '강원도' },
    { mainCategory: '지방자치단체' as const, subCategory: '충청북도', name: '충청북도' },
    { mainCategory: '지방자치단체' as const, subCategory: '충청남도', name: '충청남도' },
    { mainCategory: '지방자치단체' as const, subCategory: '전라북도', name: '전라북도' },
    { mainCategory: '지방자치단체' as const, subCategory: '전라남도', name: '전라남도' },
    { mainCategory: '지방자치단체' as const, subCategory: '경상북도', name: '경상북도' },
    { mainCategory: '지방자치단체' as const, subCategory: '경상남도', name: '경상남도' },
    { mainCategory: '지방자치단체' as const, subCategory: '제주특별자치도', name: '제주특별자치도' }
  ];

  const serviceNames = [
    '전자정부 포털', '민원24', '정부24', '국가기록원', '공공데이터포털',
    '전자조달시스템', '국가보안기술연구소', '한국과학기술원', '한국연구재단',
    '한국표준과학연구원', '한국원자력연구원', '한국에너지기술연구원',
    '한국생명공학연구원', '한국화학연구원', '한국생물자원센터',
    '한국해양과학기술원', '한국지질자원연구원', '한국천문연구원',
    '한국항공우주연구원', '한국전자통신연구원', '한국생산기술연구원',
    '한국기계연구원', '한국건설기술연구원', '한국건설기술연구원',
    '한국도로공사', '한국수자원공사', '한국토지주택공사', '한국가스공사',
    '한국전력공사', '한국수력원자력', '한국원자력안전기술원',
    '한국원자력의학원', '한국원자력연구원', '한국원자력안전기술원',
    '한국원자력안전기술원', '한국원자력안전기술원', '한국원자력안전기술원'
  ];

  const statuses: Service['status'][] = ['normal', 'maintenance', 'problem'];
  const statusWeights = [0.8, 0.1, 0.1]; // 정상 80%, 점검중 10%, 문제 10%

  const services: Service[] = [];

  for (let i = 0; i < 647; i++) {
    const agency = agencies[Math.floor(Math.random() * agencies.length)];
    const serviceName = serviceNames[Math.floor(Math.random() * serviceNames.length)];
    const random = Math.random();

    let status: Service['status'] = 'normal';
    let cumulativeWeight = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulativeWeight += statusWeights[j];
      if (random <= cumulativeWeight) {
        status = statuses[j];
        break;
      }
    }

    const responseTime = status === 'normal' ? Math.floor(Math.random() * 200) + 50 :
      status === 'maintenance' ? 0 : 0;

    services.push({
      id: (i + 1).toString(),
      name: `${serviceName} ${i + 1}`,
      url: `https://example${i + 1}.go.kr`,
      status,
      description: `${agency.name}에서 제공하는 ${serviceName} 서비스입니다.`,
      agency,
      lastChecked: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      responseTime: responseTime > 0 ? responseTime : undefined,
      tags: [`${agency.subCategory}`, '정부서비스', '전자정부']
    });
  }

  return services;
}

export const allServices = [...sampleServices, ...generateMoreSampleData()];
