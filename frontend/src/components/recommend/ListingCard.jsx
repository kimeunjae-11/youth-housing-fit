import { formatDate, formatKrw } from '../../utils/format.js'

const badgeBase = 'inline-flex whitespace-nowrap text-[14px]'
const badgeClass = `${badgeBase} border-b-2 border-accent pb-0.5 font-bold text-accent-ink`
const closedBadgeClass = `${badgeBase} font-medium text-muted`

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

export default function ListingCard({ listing, isLowestRent, budgetWon = null }) {
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

  // 적용 임대료가 확인되지 않은 공고는 서버가 상한으로 거르지 않는다. 대신 참고가와 상한을 비교해 알려준다.
  let budgetNote = null
  if (budgetWon != null && applicableRent == null && referenceRent != null) {
    budgetNote =
      referenceRent > budgetWon
        ? `입력한 월 임대료 상한(${formatKrw(budgetWon)})보다 참고가가 높아요. 실제 적용 임대료는 공고문에서 확인하세요.`
        : '참고가는 입력한 상한 이내예요. 실제 적용 임대료는 공고문에서 확인하세요.'
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white ring-1 ring-stage-line/50 p-5 sm:flex-row sm:items-center sm:gap-5">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          {isLowestRent && <span className={badgeClass}>임대료 최저</span>}
          <StatusBadge recruitmentStatus={recruitmentStatus} statusLabel={statusLabel} />
        </div>
        <h2 className="mb-1 truncate text-[19px] font-semibold tracking-[-0.02em] text-accent-ink">{name}</h2>
        <p className="truncate text-sm text-muted">
          {address}
          {area != null && ` · ${area}㎡`}
        </p>
        <p className="text-sm text-muted">{recruitPeriod(recruitStart, recruitEnd)}</p>
        {budgetNote && (
          <p
            className={`mt-1.5 text-[13px] font-semibold ${
              referenceRent > budgetWon ? 'text-error' : 'text-muted'
            }`}
          >
            {budgetNote}
          </p>
        )}
        {cautions.length > 0 && (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] text-muted">
            {cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 sm:max-w-[200px] sm:pl-2 sm:text-right">
        <div className="whitespace-nowrap text-xl font-semibold text-ink [font-feature-settings:'tnum']">{rentText}</div>
        {deposit != null && <div className="whitespace-nowrap text-sm text-muted">보증금 {formatKrw(deposit)}</div>}
        {priceLabel && <div className="mt-0.5 text-[13px] text-muted">{priceLabel}</div>}
      </div>

      {noticeUrl ? (
        <a
          href={noticeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} 공고문 보기 (새 탭)`}
          className="flex min-h-[44px] shrink-0 items-center justify-center gap-1 rounded-full bg-accent-soft px-4 text-[15px] font-medium text-accent-ink transition-[transform,background-color] duration-150 ease-out hover:bg-primary-fixed active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
        >
          <span>공고문 보기</span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            arrow_outward
          </span>
        </a>
      ) : (
        <span className="shrink-0 text-center text-[13px] text-muted">공고문 링크 없음</span>
      )}
    </article>
  )
}
