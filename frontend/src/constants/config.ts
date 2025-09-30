/**
 * 프로젝트 설정 상수
 */

// GitHub 저장소 정보
export const GITHUB_CONFIG = {
  USERNAME: 'ruby-kim',
  REPOSITORY: 'gov-status',
  get REPOSITORY_URL() {
    return `https://github.com/${this.USERNAME}/${this.REPOSITORY}`;
  }
} as const;

// 프로젝트 정보
export const PROJECT_CONFIG = {
  NAME: '정부 사이트 장애 현황 모니터링',
  DESCRIPTION: '정부 서비스들의 상태를 모니터링하고 분석하는 대시보드 (10분마다 업데이트)',
  VERSION: '1.0.0'
} as const;

// API 설정
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' ? '' : '',
  ENDPOINTS: {
    GOV_SITES_STATUS: '/api/gov-sites-status'
  }
} as const;
