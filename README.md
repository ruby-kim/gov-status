# 정부서비스 상태 모니터링 시스템

정부 서비스들의 상태를 모니터링하고 분석하는 웹 애플리케이션입니다.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-green?style=for-the-badge&logo=python)](https://python.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-red?style=for-the-badge&logo=redis)](https://redis.io/)

## 🌐 라이브 데모

**프로젝트 링크**: [정부서비스 상태 모니터링](https://gov-status.vercel.app)

## 📁 프로젝트 구조

```
gov-status/
├── frontend/          # Next.js 15 프론트엔드
│   ├── src/
│   │   ├── app/       # App Router 페이지들
│   │   │   ├── api/   # API 라우트 (Redis 연동)
│   │   │   ├── analytics/ # 분석 페이지
│   │   │   ├── services/  # 서비스 현황 페이지
│   │   │   ├── contributors/ # 기여자 페이지
│   │   │   └── report/    # 제보 페이지
│   │   ├── components/ # 재사용 가능한 컴포넌트들
│   │   ├── data/      # 정적 데이터
│   │   ├── lib/       # 유틸리티 함수들
│   │   └── types/     # TypeScript 타입 정의
│   └── package.json
├── tasks/              # Python 크롤링 및 데이터베이스 핸들링
│   ├── gov_crawler.py  # url크롤러
│   ├── status_update.py # csv기반 사이트 상태 확인 및 redis 업데이트
│   ├── gov_sites.csv   # 정부 사이트 기관 리스트
│   └── requirements.txt
├── vercel.json         # Vercel 배포 설정
└── README.md
```

## 🚀 주요 기능

### 📊 대시보드
- **전체 서비스 정상율** - 실시간 서비스 정상 운영률
- **상태별 분포** - 정상, 점검중, 문제 상태별 통계
- **기관별 현황** - 중앙행정기관, 지방자치단체별 서비스 상태
- **실시간 차트** - Pie Chart, Bar Chart를 활용한 시각화
- **10분마다 자동 업데이트** - Github Actions를 활용한 데이터 자동 업데이트 및 Redis를 통한 실시간 데이터 동기화

### 🔍 서비스 현황
- **검색 기능** - 서비스명, 기관명, 설명으로 검색
- **필터링** - 상태별, 기관 분류별 필터링
- **정렬** - 서비스명, 상태, 응답시간, 기관명별 정렬
- **뷰 모드** - 그리드/리스트 뷰 전환
- **반응형 디자인** - 모바일/태블릿/데스크톱 최적화

### 📈 분석 (Analytics)
- **기관별 정상율 차트** - 상위 10개 기관의 정상율 비교
- **서비스 상태 분포** - 정상/점검중/문제 비율 시각화
- **시간대별 트렌드** - 최근 7시간 서비스 정상율 변화
- **상세 통계 테이블** - 기관별 3개월 정상율 상세 데이터
- **모바일 최적화** - 테이블 가로 스크롤 지원

### 👥 기여자
- **팀 소개** - 프로젝트 기여자들 소개
- **실시간 통계** - API를 통한 모니터링 사이트 수 표시
- **기술 스택** - 사용된 기술들 소개
- **기여 방법** - 오픈소스 참여 가이드

### 📝 정보 제보
- **잘못된 정보 제보** - 서비스명, 기관명, URL 오류 신고
- **누락된 서비스 제보** - 목록에 없는 정부 서비스 신고
- **기술적 문제 제보** - 사이트 접속 오류, 기능 오작동 신고
- **구글 폼 연동** - 간편한 제보 시스템

## 🛠 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Recharts** - 차트 라이브러리
- **Lucide React** - 아이콘 라이브러리

### Backend & Data
- **Python 3.11+** - 크롤링 및 데이터 처리
- **BeautifulSoup4** - HTML 파싱
- **Requests** - HTTP 요청
- **Redis** - 실시간 데이터 저장소
- **CSV** - 초기 데이터 저장

### Infrastructure
- **Vercel** - 프론트엔드 배포
- **Redis Cloud** - 데이터베이스 호스팅
- **GitHub Actions** - CI/CD (선택사항)

## 🚀 실행 방법

### 1. Frontend 실행
```bash
cd frontend
npm install
npm run dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

### 2. Backend 실행 (크롤링)
```bash
cd tasks
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python gov_crawler.py
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:
```env
# Redis 연결 정보
REDIS_URL=your_redis_connection_string
REDIS_PASSWORD=your_redis_password

# 기타 설정
NODE_ENV=development
```

## 📱 반응형 디자인

- **모바일 최적화** - 모든 페이지가 모바일에서 최적화됨
- **태블릿 지원** - 중간 크기 화면에서 적절한 레이아웃
- **데스크톱** - 대형 화면에서 최대한 활용

## 🎨 UI/UX 특징

- **현대적인 디자인** - 깔끔하고 직관적인 인터페이스
- **색상 코딩** - 상태별 일관된 색상 시스템
- **애니메이션** - 부드러운 전환 효과
- **접근성** - 키보드 네비게이션 및 스크린 리더 지원

## 📊 데이터 구조

### Service 타입
```typescript
interface Service {
  id: string;
  name: string;
  url: string;
  status: 'normal' | 'warning' | 'error' | 'maintenance';
  description?: string;
  agency: {
    mainCategory: '중앙행정기관' | '지방자치단체';
    subCategory: string;
    name: string;
  };
  lastChecked: Date;
  responseTime?: number;
  tags: string[];
}
```

## 🚀 Vercel 배포 가이드

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. Vercel 로그인
```bash
vercel login
```

### 3. 프로젝트 배포
```bash
# 프로젝트 루트에서 실행
vercel

# 또는 프론트엔드 폴더에서 실행
cd frontend
vercel
```

### 4. 환경 변수 설정 (선택사항)
Vercel 대시보드에서 환경 변수 설정:
- `NODE_ENV`: `production`
- 기타 필요한 환경 변수들

### 5. 자동 배포 설정
GitHub 저장소와 연결하면 자동 배포됩니다:
1. Vercel 대시보드에서 "Import Project" 클릭
2. GitHub 저장소 선택
3. 빌드 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 6. 커스텀 도메인 설정 (선택사항)
Vercel 대시보드에서 도메인을 추가할 수 있습니다.

## 🔄 향후 계획

1. **알림 시스템** - 서비스 장애 시 이메일/푸시 알림 기능
2. **히스토리 추적** - 서비스 상태 변화 이력 및 트렌드 분석
3. **PWA 지원** - 모바일 앱처럼 사용 가능한 Progressive Web App
4. **다국어 지원** - 영어, 일본어 등 다국어 지원
5. **API 문서화** - Swagger/OpenAPI를 통한 API 문서 자동화
6. **모니터링 대시보드** - 시스템 상태 및 성능 모니터링

## 🤝 기여하기

이 프로젝트는 오픈소스로 운영되며, 누구나 기여할 수 있습니다.

1. 저장소 **Fork**
2. **Branch** 생성 (`git checkout -b feature/***`)
3. **Commit** 변경사항 적용 (`git commit -m 'feat: ***'`)
4. 브렌치 **Push**(`git push origin feature/***`)
5. **Pull Request** 생성

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE.md) 파일을 참조하세요.

## 👨‍💻 개발자

**김루비** - govstatus@anb-network.com

## 🙏 감사의 말

이 프로젝트는 정부의 디지털 서비스 투명성 향상을 목표로 제작되었습니다.