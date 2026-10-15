// '2026-10-12' → '2026.10.12'
export const formatDate = (iso) => iso.replaceAll('-', '.')

// 1234 → '1,234만원' (만원 단위 값)
export const formatWon = (value) => `${value.toLocaleString('ko-KR')}만원`

// 원 단위 값 → 읽기 쉬운 금액. 26180000 → '2,618만원', 122170 → '12만 2,170원', 8000 → '8,000원'
export function formatKrw(won) {
  const man = Math.floor(won / 10_000)
  const rest = won % 10_000
  if (man === 0) return `${rest.toLocaleString('ko-KR')}원`
  if (rest === 0) return `${man.toLocaleString('ko-KR')}만원`
  return `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원`
}

// 'YYYY-MM-DD' 까지 남은 일수 (오늘 = 0, 지난 날짜는 음수)
export function daysUntil(iso, today = new Date()) {
  const [year, month, day] = iso.split('-').map(Number)
  const target = new Date(year, month - 1, day)
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((target - base) / 86_400_000)
}
