import { daysUntil, formatDate, formatWon } from '../../utils/format.js'

const badgeBase = 'inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold'
const badgeClass = `${badgeBase} bg-accent-soft text-primary`
const closedBadgeClass = `${badgeBase} bg-surface-container text-subtle`

function DeadlineBadge({ recruitEnd }) {
  const days = daysUntil(recruitEnd)
  if (days < 0) return <span className={closedBadgeClass}>모집 마감</span>
  return <span className={badgeClass}>{days === 0 ? '오늘 마감' : `마감 D-${days}`}</span>
}

export default function ListingCard({ listing, isLowestRent }) {
  const { name, address, area, deposit, rent, recruitStart, recruitEnd, noticeUrl } = listing

  return (
    <article className="flex flex-col gap-3 rounded-[20px] border border-line-soft bg-white p-4 shadow-listing transition-all hover:-translate-y-0.5 hover:shadow-listing-hover sm:flex-row sm:items-center sm:gap-5">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {isLowestRent && <span className={badgeClass}>임대료 최저</span>}
          <DeadlineBadge recruitEnd={recruitEnd} />
        </div>
        <h2 className="mb-1 truncate text-[18px] font-bold text-ink">{name}</h2>
        <p className="truncate text-sm text-muted">
          {address} · {area}㎡
        </p>
        <p className="text-sm text-subtle">
          모집 {formatDate(recruitStart)} ~ {formatDate(recruitEnd)}
        </p>
      </div>

      <div className="shrink-0 whitespace-nowrap sm:pl-2 sm:text-right">
        <div className="text-xl font-bold text-ink">
          {rent == null ? '임대료 공고 예정' : `월 ${formatWon(rent)}`}
        </div>
        <div className="text-sm text-muted">보증금 {formatWon(deposit)}</div>
      </div>

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
    </article>
  )
}
