// '2026-10-12' → '2026.10.12'
export const formatDate = (iso) => iso.replaceAll('-', '.')

// 1234 → '1,234만원' (금액은 모두 만원 단위)
export const formatWon = (value) => `${value.toLocaleString('ko-KR')}만원`

// 'YYYY-MM-DD' 까지 남은 일수 (오늘 = 0, 지난 날짜는 음수)
export function daysUntil(iso, today = new Date()) {
  const [year, month, day] = iso.split('-').map(Number)
  const target = new Date(year, month - 1, day)
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((target - base) / 86_400_000)
}
