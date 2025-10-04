/**
 * 프로젝트 설정 상수
 */
import { CheckCircle, XCircle, Wrench } from 'lucide-react';

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

// 행정안전부 공지사항 (네이버)
export const EXTERNAL_LINKS = {
  NAVER_NOTICE: 'https://notice.naver.com/notices/wwwpc?searchValue=%25EA%25B5%25AD%25EA%25B0%2580%25EC%25A0%2595%25EB%25B3%25B4%25EC%259E%2590%25EC%259B%2590%25EA%25B4%2580%25EB%25A6%25AC%25EC%259B%2590%2520%25ED%2599%2594%25EC%259E%25AC&page=1&pageSize=10&newNoticeHour=168&darkmode=n&t=l'
} as const;

// 상태별 스타일 매핑
export const STATUS_CONFIG = {
  normal: {
    label: '정상',
    icon: CheckCircle,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    iconColor: 'text-green-600',
  },
  maintenance: {
    label: '점검중',
    icon: Wrench,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  problem: {
    label: '문제',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    iconColor: 'text-red-600',
  },
} as const;

export type StatusKey = keyof typeof STATUS_CONFIG;