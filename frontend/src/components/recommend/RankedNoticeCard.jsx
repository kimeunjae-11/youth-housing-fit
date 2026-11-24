import { daysUntil, formatDate, formatKrw } from '../../utils/format.js'

// 추천 점수 항목 키 → 화면 이름
const SCORE_LABELS = {
  rent: '월 임대료',
  deposit: '보증금',
  area: '전용면적',
  region: '희망 지역',
  deadline: '접수 마감',
}

// 가중치가 있는 항목만 큰 순서로 보여준다. 값이 null 이면 공고에 비교할 정보가 없다는 뜻이다.
function scoreRows(breakdown = {}, weights = {}) {
  return Object.entries(weights)
    .filter(([key, weight]) => weight > 0 && key in SCORE_LABELS)
    .sort((a, b) => b[1] - a[1])
    .map(([key, weight]) => ({ key, label: SCORE_LABELS[key], weight, value: breakdown[key] ?? null }))
}

function deadlineText(end) {
  if (!end) return '접수 마감일 미확인'
  const days = daysUntil(end)
  const dday = days === 0 ? '오늘 마감' : days > 0 ? `D-${days}` : '마감'
  return `${formatDate(end)} 마감 · ${dday}`
}

export default function RankedNoticeCard({ notice, rank, weights }) {
  const {
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

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-stage-line/50">
      <div className="flex items-start gap-4">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold [font-feature-settings:'tnum'] ${
            rank === 1 ? 'bg-accent text-accent-ink' : 'bg-accent-soft text-accent-ink'
          }`}
          aria-label={`추천 ${rank}위`}
        >
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-keep text-[19px] font-semibold tracking-[-0.02em] text-accent-ink">{name}</h3>
          <p className="break-keep text-sm text-muted">
            {address ?? '주소 미확인'}
            {area != null && <span className="whitespace-nowrap">{` · ${area}㎡`}</span>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] text-muted">추천 점수</p>
          <p className="text-2xl font-semibold text-ink [font-feature-settings:'tnum']">
            {score == null ? '–' : score}
            {score != null && <span className="ml-0.5 text-sm font-medium text-muted">점</span>}
          </p>
        </div>
      </div>

      {rows.length > 0 && (
        <dl className="grid gap-2 rounded-xl bg-surface-container-low p-4">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[88px_minmax(0,1fr)_56px] items-center gap-3 text-[13px]">
              <dt className="text-ink">
                {row.label}
                <span className="ml-1 text-muted">{row.weight}%</span>
              </dt>
              <dd className="h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
                {row.value != null && (
                  <div className="h-full rounded-full bg-accent" style={{ width: `${row.value}%` }} />
                )}
              </dd>
              <dd className="text-right text-muted [font-feature-settings:'tnum']">
                {row.value == null ? '정보 없음' : `${Math.round(row.value)}점`}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {reasons.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="추천 이유">
          {reasons.map((reason) => (
            <li key={reason} className="rounded-full bg-accent-soft px-3 py-1 text-[13px] font-medium text-accent-ink">
              {reason}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{rent != null ? `월 ${formatKrw(rent)}` : '월 임대료 미확인'}</span>
          {deposit != null && ` · 보증금 ${formatKrw(deposit)}`}
          <br />
          {deadlineText(end)}
        </p>
        {noticeUrl && (
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
        )}
      </div>
    </article>
  )
}
