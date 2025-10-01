/**
 * 퍼센트 값을 포맷팅하는 함수
 * 0%와 100%는 소수점 없이, 나머지는 소수점 1자리로 표시
 */
export function formatPercentage(value: number): string {
  if (value === 0) return '0%';
  if (value === 100) return '100%';
  return `${value.toFixed(1)}%`;
}

/**
 * 기관명과 정상율을 함께 포맷팅하는 함수
 */
export function formatAgencyWithRate(name: string, rate: number): string {
  return `${name} (${formatPercentage(rate)})`;
}
