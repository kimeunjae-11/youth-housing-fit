import { daysUntil, formatDate, formatKrw } from '../../utils/format.js'
import { focusRing } from '../ui.js'
import { SCORE_LABELS } from '../../utils/scoreLabels.js'

// 가중치가 있는 항목만 큰 순서로. 값이 null 이면 공고에 비교할 정보가 없다는 뜻이다.
function scoreRows(breakdown = {}, weights = {}) {
  return Object.entries(weights)
    .filter(([key, weight]) => weight > 0 && key in SCORE_LABELS)
    .sort((a, b) => b[1] - a[1])
    .map(([key, weight]) => ({ key, label: SCORE_LABELS[key], weight, value: breakdown[key] ?? null }))
}

function dday(end) {
  if (!end) return null
  const days = daysUntil(end)
  return days === 0 ? '오늘 마감' : days > 0 ? `D-${days}` : '마감'
}

// 항목별 점수 원형 게이지 (0~100)
function ScoreRing({ label, value }) {
  const r = 22
  const c = 2 * Math.PI * r
  return (
    <div className="flex w-16 flex-col items-center gap-1.5">
      <div className="relative size-14">
        <svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#EDE3D3" strokeWidth="4" />
          {value != null && (
            <circle
              cx="28"
              cy="28"
              r={r}
              fill="none"
              stroke="#B5581C"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(c * Math.min(100, Math.max(0, value))) / 100} ${c}`}
              transform="rotate(-90 28 28)"
            />
          )}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[16px] font-bold [font-feature-settings:'tnum']">
          {value == null ? '–' : Math.round(value)}
        </span>
      </div>
      <span className="whitespace-nowrap text-[12px] text-fit-muted">{label}</span>
    </div>
  )
}

/**
 * 추천 TOP 3 한 줄. 순위 숫자 / 공고 정보 / 항목별 점수 원 / 추천 점수 / 펼치기.
 * 펼치면 보증금·월 임대료·면적·마감과 추천 이유, 공고문 링크가 나온다.
 */
export default function RankedNoticeCard({ notice, rank, weights, expanded, onToggle }) {
  const {
    id,
    name,
    address,
    area_sqm: area,
    deposit,
    applicable_monthly_rent: rent,
    application_end: end,
    notice_url: noticeUrl,
    recommendation_score: score,
    score_breakdown: breakdown,
    recommendation_reasons: reasons = [],
  } = notice
  const rows = scoreRows(breakdown, weights)
  const remaining = dday(end)
  const detailId = `notice-detail-${id}`
  const stats = [
    ['보증금', deposit != null ? formatKrw(deposit) : '미확인'],
    ['월 임대료', rent != null ? formatKrw(rent) : '미확인'],
    ['전용면적', area != null ? `${area}㎡` : '미확인'],
    ['접수 마감', end ? formatDate(end).slice(5) : '미확인'],
    ['남은 기간', remaining ?? '미확인'],
  ]

  return (
    <article aria-labelledby={`notice-${id}`}>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5 px-7 py-6">
        <p
          aria-label={`추천 ${rank}위`}
          className={`w-14 shrink-0 font-serif text-[36px] font-medium leading-none tracking-[-0.02em] [font-feature-settings:'tnum'] ${
            rank === 1 ? 'text-fit-amber' : 'text-fit-mocha'
          }`}
        >
          {String(rank).padStart(2, '0')}
        </p>
        <div className="min-w-0 flex-[1_1_260px] border-fit-line sm:border-l sm:pl-7">
          <h3 id={`notice-${id}`} className="break-keep text-[19px] font-bold">
            {name}
          </h3>
          <p className="mt-1.5 break-keep text-[14px] text-fit-muted">
            {address ?? '주소 미확인'}
            {area != null && ` · 전용 ${area}㎡`}
          </p>
          <p className="mt-2 text-[13px] text-fit-muted">
            접수 중{end && ` · ${formatDate(end)} 마감`}
            {remaining && (
              <>
                {' · '}
                <span className="font-bold text-fit-deep">{remaining}</span>
              </>
            )}
          </p>
        </div>
        {rows.length > 0 && (
          <div className="flex gap-2" aria-label="항목별 점수">
            {rows.slice(0, 3).map((row) => (
              <ScoreRing key={row.key} label={row.label} value={row.value} />
            ))}
            <span className="sr-only">
              {rows.map((row) => `${row.label} ${row.value == null ? '정보 없음' : `${Math.round(row.value)}점`}`).join(', ')}
            </span>
          </div>
        )}
        <div className="w-[112px] shrink-0 border-fit-line text-right sm:border-l sm:pl-6">
          <p className="text-[12px] text-fit-muted">추천 점수</p>
          <p className="mt-0.5 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-fit-mocha [font-feature-settings:'tnum']">
            {score == null ? '–' : score}
          </p>
          <p className="mt-0.5 text-[12px] text-fit-muted">/ 100점</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={detailId}
          aria-label={`${name} 자세히 보기`}
          className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-fit-line2 bg-white hover:bg-fit-bg ${focusRing}`}
        >
          <svg aria-hidden="true" className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div id={detailId} className="mx-7 mb-6 flex flex-wrap items-center gap-x-0 gap-y-4 rounded-xl bg-fit-bg px-1 py-[18px]">
          <dl className="flex flex-wrap [font-feature-settings:'tnum']">
            {stats.map(([term, value], index) => (
              <div key={term} className={`flex flex-col-reverse px-5 py-1 ${index ? 'border-l border-fit-line2' : ''}`}>
                <dt className="mt-0.5 text-[12px] text-fit-muted">{term}</dt>
                <dd className="text-[18px] font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          {reasons.length > 0 && (
            <ul aria-label="추천 이유" className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5 px-5 text-[14px]">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-center gap-2 font-semibold text-[#3E5530]">
                  <svg aria-hidden="true" className="shrink-0" width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#4F6B3A" />
                    <path d="M7.5 12.5l3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                  {reason}
                </li>
              ))}
            </ul>
          )}
          {noticeUrl && (
            <a
              href={noticeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mx-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-fit-amber px-[18px] text-[15px] font-semibold text-white hover:bg-fit-deep ${focusRing}`}
            >
              공고문 보기<span className="sr-only"> (새 탭)</span>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
            </a>
          )}
        </div>
      )}
    </article>
  )
}
