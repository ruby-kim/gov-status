export const STATUS_STYLES = {
  normal: {
    text: '정상',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  maintenance: {
    text: '점검중',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  problem: {
    text: '문제',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
} as const;
export type StatusKey = keyof typeof STATUS_STYLES;

export const RANK_ICONS = ['🥇', '🥈', '🥉'] as const;
export const RANK_COLORS = ['text-yellow-500', 'text-gray-500', 'text-amber-700'] as const;
