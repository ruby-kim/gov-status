// 공통 Cache-Control 헤더
export const DEFAULT_API_HEADERS = {
  'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=0',
} as const;

// 컬렉션 이름 상수
export const COLLECTIONS = {
  OVERALL_STATS: 'overall_stats',
  GOV_SITES: 'gov_sites',
  GOV_SITES_STATUS: 'gov_sites_status',
  GOV_SITES_SUMMARY: 'gov_sites_summary',
} as const;

// 기본 통계 구조 (fallback)
export const DEFAULT_STATS = {
  total: 0,
  normal: 0,
  maintenance: 0,
  problem: 0,
} as const;
