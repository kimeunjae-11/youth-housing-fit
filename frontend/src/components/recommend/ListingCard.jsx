import { formatDate, formatKrw } from '../../utils/format.js'

const badgeBase = 'inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold'
const badgeClass = `${badgeBase} bg-accent-soft text-primary`
const closedBadgeClass = `${badgeBase} bg-surface-container text-subtle`

// 모집 상태 배지. 문구는 서버의 status_label 을 그대로 쓴다. (마감 공고는 '접수 마감 · 참고용')
function StatusBadge({ recruitmentStatus, statusLabel }) {
  return (
    <span className={recruitmentStatus === 'closed' ? closedBadgeClass : badgeClass}>{statusLabel}</span>
  )
}

function recruitPeriod(recruitStart, recruitEnd) {
  if (!recruitStart || !recruitEnd) return '접수 일정 미확인'
  return `접수 ${formatDate(recruitStart)} ~ ${formatDate(recruitEnd)}`
}

export default function ListingCard({ listing, isLowestRent }) {
  const {
    name,
    address,
    area,
    deposit,
    referenceRent,
    applicableRent,
    priceLabel,
    recruitStart,
    recruitEnd,
    recruitmentStatus,
    statusLabel,
    noticeUrl,
    cautions,
  } = listing

  // 사용자에게 적용되는 임대료가 확인된 경우에만 확정 금액처럼 보여준다.
  // 확인 전에는 요약 참고 가격이라고 밝히고, 참고 가격조차 없으면 공고 예정으로 표시한다.
  let rentText = '임대료 공고 예정'
  if (applicableRent != null) rentText = `월 ${formatKrw(applicableRent)}`
  else if (referenceRent != null) rentText = `참고 월 ${formatKrw(referenceRent)}`

  return (
    <article className="flex flex-col gap-3 rounded-[20px] border border-line-soft bg-white p-4 shadow-listing transition-all hover:-translate-y-0.5 hover:shadow-listing-hover sm:flex-row sm:items-center sm:gap-5">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {isLowestRent && <span className={badgeClass}>임대료 최저</span>}
          <StatusBadge recruitmentStatus={recruitmentStatus} statusLabel={statusLabel} />
        </div>
        <h2 className="mb-1 truncate text-[18px] font-bold text-ink">{name}</h2>
        <p className="truncate text-sm text-muted">
          {address}
          {area != null && ` · ${area}㎡`}
        </p>
        <p className="text-sm text-subtle">{recruitPeriod(recruitStart, recruitEnd)}</p>
        {cautions.length > 0 && (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-subtle">
            {cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 sm:max-w-[200px] sm:pl-2 sm:text-right">
        <div className="whitespace-nowrap text-xl font-bold text-ink">{rentText}</div>
        {deposit != null && <div className="whitespace-nowrap text-sm text-muted">보증금 {formatKrw(deposit)}</div>}
        {priceLabel && <div className="mt-0.5 text-xs text-subtle">{priceLabel}</div>}
      </div>

      {noticeUrl ? (
        <a
          href={noticeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} 공고문 보기 (새 탭)`}
          className="flex shrink-0 items-center justify-center gap-1 rounded-full bg-accent-soft px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-fixed"
        >
          <span>공고문 보기</span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            arrow_outward
          </span>
        </a>
      ) : (
        <span className="shrink-0 text-center text-xs text-subtle">공고문 링크 없음</span>
      )}
    </article>
  )
}
