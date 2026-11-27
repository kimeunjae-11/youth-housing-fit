import { formatDate, formatKrw } from '../../utils/format.js'
import { focusRing } from '../ui.js'
import { LISTING_GRID } from './listingGrid.js'

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
  let rentText = '공고 예정'
  if (applicableRent != null) rentText = formatKrw(applicableRent)
  else if (referenceRent != null) rentText = formatKrw(referenceRent)
  const rentIsReference = applicableRent == null && referenceRent != null

  // 적용 임대료가 확인되지 않은 공고는 서버가 상한으로 거르지 않는다. 대신 참고가와 상한을 비교해 알려준다.
  let budgetNote = null
  if (budgetWon != null && rentIsReference) {
    budgetNote =
      referenceRent > budgetWon
        ? `입력한 월 임대료 상한(${formatKrw(budgetWon)})보다 참고가가 높아요. 실제 적용 임대료는 공고문에서 확인하세요.`
        : '참고가는 입력한 상한 이내예요. 실제 적용 임대료는 공고문에서 확인하세요.'
  }
  const closed = recruitmentStatus === 'closed'

  return (
    <article className={`flex flex-col gap-2 border-t border-fit-line px-3.5 py-[18px] text-[15px] [font-feature-settings:'tnum'] ${LISTING_GRID}`}>
      <div className="min-w-0">
        <h3 className="break-keep text-[16px] font-semibold">
          {name}
          {isLowestRent && <span className="ml-2 rounded-full bg-fit-champagne px-2 py-0.5 align-middle text-[12px] font-semibold text-fit-deep">임대료 최저</span>}
        </h3>
        <p className="mt-0.5 break-keep text-[13px] text-fit-muted">{address}</p>
        <p className="mt-0.5 text-[13px] text-fit-muted">{recruitPeriod(recruitStart, recruitEnd)}</p>
        {budgetNote && (
          <p className={`mt-1 text-[13px] font-semibold ${referenceRent > budgetWon ? 'text-error' : 'text-fit-muted'}`}>{budgetNote}</p>
        )}
        {cautions.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px] text-fit-muted">
            {cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-fit-muted">
        <span className="md:sr-only">전용 </span>
        {area != null ? `${area}㎡` : '–'}
      </p>
      <p className="md:text-right">
        <span className="text-fit-muted md:sr-only">보증금 </span>
        {deposit != null ? formatKrw(deposit) : '–'}
      </p>
      <p className="font-bold md:text-right">
        <span className="font-normal text-fit-muted md:sr-only">월 임대료 </span>
        {rentText}
        {(rentIsReference || priceLabel) && (
          <span className="mt-0.5 block text-[12px] font-normal leading-[1.4] text-fit-muted">{priceLabel || '참고 가격'}</span>
        )}
      </p>
      <p>
        <span
          className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            closed ? 'bg-fit-line text-fit-muted' : 'bg-fit-champagne text-fit-deep'
          }`}
        >
          {statusLabel}
        </span>
      </p>
      {noticeUrl ? (
        <a
          href={noticeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} 공고문 보기 (새 탭)`}
          className={`inline-flex min-h-[44px] items-center gap-1 text-[14px] font-semibold text-fit-deep md:justify-end ${focusRing}`}
        >
          공고문
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </svg>
        </a>
      ) : (
        <span className="text-[13px] text-fit-muted">링크 없음</span>
      )}
    </article>
  )
}
