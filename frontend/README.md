# 정부서비스 상태 모니터링 - Frontend

Next.js 15와 Tailwind CSS로 구축된 정부 서비스 상태 모니터링 대시보드의 프론트엔드입니다.

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 대시보드 (홈페이지)
│   ├── services/          # 서비스 현황 페이지
│   ├── analytics/         # 분석 페이지
│   ├── report/            # 정보 제보 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 가능한 컴포넌트
│   ├── Header.tsx         # 네비게이션 헤더
│   ├── StatusCard.tsx     # 상태 카드
│   ├── StatsOverview.tsx  # 통계 개요
│   ├── ServiceCard.tsx    # 서비스 카드
│   ├── ServiceFilters.tsx # 서비스 필터
│   ├── AgencyStatsTable.tsx # 기관별 통계 테이블
│   └── StatusDistributionChart.tsx # 상태 분포 차트
├── data/                  # 데이터
│   └── sampleData.ts      # 샘플 서비스 데이터
└── types/                 # TypeScript 타입
    └── service.ts         # 서비스 관련 타입 정의
```

## 🎨 주요 컴포넌트

### StatusCard
서비스 상태를 시각적으로 표시하는 카드 컴포넌트
- 정상, 경고, 오류, 점검중 상태별 색상 구분
- 아이콘과 퍼센티지 표시

### ServiceCard
개별 서비스 정보를 표시하는 카드
- 서비스명, 기관명, 설명
- 마지막 확인 시간, 응답 시간
- 태그 시스템

### ServiceFilters
서비스 목록 필터링 및 검색 기능
- 상태별 필터
- 기관 분류별 필터
- 텍스트 검색

## 📊 차트 및 시각화

- **Recharts** 라이브러리 사용
- Pie Chart: 상태별 분포
- Bar Chart: 기관별 정상율
- Line Chart: 시간대별 트렌드

## 🎯 페이지별 기능

### 대시보드 (/)
- 전체 서비스 정상율
- 상태별 통계 카드
- 기관별 현황 테이블
- 상태 분포 차트

### 서비스 현황 (/services)
- 647개 서비스 목록
- 검색 및 필터링
- 정렬 기능
- 그리드/리스트 뷰

### 분석 (/analytics)
- 기관별 정상율 차트
- 시간대별 트렌드
- 상세 통계 테이블

### 정보 제보 (/report)
- 잘못된 정보 제보
- 누락된 서비스 신고
- 기술적 문제 제보
- 구글 폼 연동

## 🛠 기술 스택

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Recharts** - 차트 라이브러리
- **Lucide React** - 아이콘

## 📱 반응형 디자인

모든 컴포넌트가 모바일, 태블릿, 데스크톱에서 최적화되어 있습니다.

- **모바일**: 1열 그리드, 접을 수 있는 필터
- **태블릿**: 2열 그리드, 중간 크기 레이아웃
- **데스크톱**: 3-4열 그리드, 전체 기능 표시

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 📈 성능 최적화

- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 분할**: 페이지별 자동 코드 분할
- **메모이제이션**: useMemo, useCallback 활용
- **가상화**: 대용량 목록에 대한 가상 스크롤링 (향후 구현 예정)

## 🎨 디자인 시스템

### 색상 팔레트
- **정상**: Green (10B981)
- **경고**: Yellow (F59E0B)
- **오류**: Red (EF4444)
- **점검중**: Blue (3B82F6)

### 타이포그래피
- **제목**: Inter Bold
- **본문**: Inter Regular
- **코드**: Inter Mono

## 🔄 상태 관리

현재는 로컬 상태 관리를 사용하고 있으며, 향후 백엔드 API와 연동 시 상태 관리 라이브러리 도입을 고려할 수 있습니다.

## 📝 TODO

- [ ] 백엔드 API 연동
- [ ] 실시간 WebSocket 연결
- [ ] 사용자 인증 시스템
- [ ] 알림 기능
- [ ] 다크 모드
- [ ] PWA 지원