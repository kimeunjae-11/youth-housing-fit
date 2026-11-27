import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { checkEligibility } from '../api/eligibility.js'
import StateMessage, { softButtonClass } from '../components/StateMessage.jsx'
import EligibilityTable, { VerdictIcon } from '../components/result/EligibilityTable.jsx'
import PolicyRecommendation from '../components/result/PolicyRecommendation.jsx'
import { btnPrimary, card, linkDeep, sectionLabel, serifTitle } from '../components/ui.js'
import { formatDate } from '../utils/format.js'

const TYPE_LABELS = {
  'happy-youth': '행복주택 청년계층',
}

const FALLBACK_ERROR_MESSAGE = '자격 판정에 실패했어요. 잠시 후 다시 시도해 주세요.'

const typeLabelOf = (type) => TYPE_LABELS[type] ?? type

// 같은 항목 이름의 추가 확인 사유를 묶는다. (예: '공고문 예외 규칙' 여러 건)
function groupReviews(reviews) {
  const groups = new Map()
  for (const { label, reason } of reviews) {
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(reason)
  }
  return [...groups].map(([label, reasons]) => ({ label, reasons }))
}

function getHeading({ status, data }) {
  if (status === 'loading') {
    return { title: '자격을 판정하고 있어요', subtitle: '입력하신 조건을 기준과 비교하는 중입니다.' }
  }
  if (status === 'error') {
    return { title: '판정 결과를 불러오지 못했어요', subtitle: '조건은 그대로 두었으니 다시 시도해 보세요.' }
  }
  if (data.items.length === 0) {
    return { title: '판정 결과가 비어 있어요', subtitle: '조건은 그대로 두었으니 다시 시도해 보세요.' }
  }
  const failed = data.items.filter((item) => item.verdict === 'not_met').length
  if (data.status === 'not_met') {
    return {
      title: '기준에 맞지 않는 항목이 있어요',
      subtitle: `검사한 ${data.assessedCount}개 항목 중 ${failed}개가 기준에 맞지 않아요.`,
    }
  }
  if (data.status === 'met') {
    return {
      title: '등록된 기준을 모두 충족했어요',
      subtitle: `검사한 ${data.assessedCount}개 항목을 모두 충족했습니다. 실제 신청 자격은 공고문에서 확인하세요.`,
    }
  }
  // needs_review: 검사한 항목에 미충족은 없지만 추가 확인이 남았다. '신청 가능'이라고 하지 않는다.
  return {
    title: '기본 조건은 충족했어요',
    subtitle: '검사한 항목에는 미충족이 없어요. 아직 확인이 필요한 항목은 아래 목록을 공고문에서 확인하세요.',
  }
}

function SummaryStats({ items }) {
  const count = (verdict) => items.filter((item) => item.verdict === verdict).length
  const stats = [
    { label: '충족', value: count('met'), className: 'text-fit-ok' },
    { label: '확인 필요', value: count('unknown'), className: 'text-fit-deep' },
    { label: '미충족', value: count('not_met'), className: count('not_met') ? 'text-error' : '' },
  ]
  const barColor = { met: 'bg-fit-ok', unknown: 'bg-fit-amber', not_met: 'bg-error' }

  return (
    <>
      <dl className="grid w-full grid-cols-3 gap-2.5 lg:w-[420px]">
        {stats.map((stat) => (
          <div key={stat.label} className={`${card} rounded-[14px] px-[18px] py-4`}>
            <dt className="text-[13px] text-fit-muted">{stat.label}</dt>
            <dd className={`mt-1 text-[30px] font-bold [font-feature-settings:'tnum'] ${stat.className}`}>{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div aria-hidden="true" className="order-last mt-1 flex w-full gap-1">
        {items.map((item) => (
          <span key={item.key} className={`h-2 flex-1 rounded-full ${barColor[item.verdict]}`} />
        ))}
      </div>
    </>
  )
}

function ReviewList({ reviews }) {
  const groups = groupReviews(reviews)
  return (
    <section aria-labelledby="review-title" className={`${card} p-7`}>
      <h2 id="review-title" className="text-[20px] font-bold">
        공고문에서 확인할 내용
      </h2>
      <p className="mt-1.5 text-[15px] text-fit-muted">입력만으로 정할 수 없어서 신청 전에 직접 확인해야 해요.</p>
      <ul className="mt-5 flex flex-col gap-3">
        {groups.map(({ label, reasons }, index) => (
          <li key={label} className={`flex gap-3.5 rounded-[14px] px-5 py-[18px] ${index === 0 ? 'bg-fit-champagne' : 'border border-fit-line2'}`}>
            <span className="mt-0.5 shrink-0">
              <VerdictIcon verdict="unknown" />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-bold">
                {label}
                {reasons.length > 1 && ` ${reasons.length}건`}
              </p>
              {reasons.length === 1 ? (
                <p className="mt-1 text-[15px] leading-[1.6] text-fit-muted">{reasons[0]}</p>
              ) : (
                <ul className="mt-2 grid list-disc gap-x-6 gap-y-1.5 pl-[18px] text-[15px] leading-[1.6] text-fit-muted sm:grid-cols-2">
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function NextStepCard({ canProceed, onRecommend, onEdit }) {
  return (
    <section aria-labelledby="next-title" className={`${card} p-7`}>
      <p className="text-[13px] font-semibold text-fit-deep">다음 단계</p>
      {canProceed ? (
        <>
          <h2 id="next-title" className={`${serifTitle} mt-2 text-[24px] leading-[1.4]`}>
            조건에 맞는 공고를 볼 수 있어요
          </h2>
          <p className="mt-2.5 text-[15px] leading-[1.65] text-fit-muted">
            미충족 항목이 없어서 추천 주택으로 넘어갈 수 있어요. 확인 필요 항목은 그대로 남아 있어요.
          </p>
          <button type="button" onClick={onRecommend} className={`${btnPrimary} mt-[22px] min-h-[54px] w-full text-[17px]`}>
            추천 주택 보기
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button type="button" onClick={onEdit} className={`${linkDeep} mt-2 w-full justify-center font-normal text-fit-muted`}>
            조건 수정하고 다시 판정하기
          </button>
        </>
      ) : (
        <>
          <h2 id="next-title" className={`${serifTitle} mt-2 text-[24px] leading-[1.4]`}>
            조건을 바꿔 다시 확인해 보세요
          </h2>
          <p className="mt-2.5 text-[15px] leading-[1.65] text-fit-muted">
            기준에 맞지 않는 항목이 있으면 추천 주택을 볼 수 없어요. 입력값이 맞는지 먼저 확인해 주세요.
          </p>
          <button type="button" onClick={onEdit} className={`${btnPrimary} mt-[22px] min-h-[54px] w-full text-[17px]`}>
            조건 수정하기
          </button>
        </>
      )}
    </section>
  )
}

function ResultContent({ condition }) {
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    checkEligibility(condition)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', message: error?.message || FALLBACK_ERROR_MESSAGE })
      })
    return () => {
      cancelled = true
    }
  }, [condition, attempt])

  const { status, data, message } = state
  const { title, subtitle } = getHeading({ status, data })
  const isEmpty = status === 'success' && data.items.length === 0
  const ready = status === 'success' && !isEmpty
  // 미충족 항목이 있으면 막고, 추가 확인(needs_review)만 남은 경우는 참고용 주택 탐색으로 넘어갈 수 있다
  const canProceed = ready && data.status !== 'not_met'
  const failedItems = ready ? data.items.filter((item) => item.verdict === 'not_met') : []

  const retry = () => {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }
  const goBackToCondition = () => navigate('/condition', { state: { condition } })
  const goToRecommend = () => navigate('/recommend', { state: { condition } })

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-[88px] pt-14" aria-busy={status === 'loading'}>
      <section aria-labelledby="result-title" className="flex flex-wrap items-end justify-between gap-8">
        <div className="min-w-0 flex-[1_1_520px]">
          <p className={sectionLabel}>{ready ? `${typeLabelOf(data.type)} · 참고용 판정` : '자격 판정'}</p>
          <h1 id="result-title" className={`${serifTitle} mt-3 text-[clamp(2rem,3.4vw,2.875rem)] leading-[1.3]`}>
            {title}
          </h1>
          <p className="mt-3.5 max-w-[52ch] text-[17px] leading-[1.7] text-fit-muted">{subtitle}</p>
        </div>
        {ready && <SummaryStats items={data.items} />}
      </section>

      {status === 'loading' && (
        <div className="mt-10">
          <StateMessage variant="loading" bordered message="자격을 판정하고 있어요…" />
        </div>
      )}

      {status === 'error' && (
        <div className="mt-10">
          <StateMessage variant="error" bordered message={message}>
            <button type="button" onClick={retry} className={softButtonClass}>
              다시 시도
            </button>
            <button type="button" onClick={goBackToCondition} className={softButtonClass}>
              조건 수정하기
            </button>
          </StateMessage>
        </div>
      )}

      {isEmpty && (
        <div className="mt-10">
          <StateMessage variant="empty" bordered message="판정할 항목을 받지 못했어요. 잠시 후 다시 시도해 주세요.">
            <button type="button" onClick={retry} className={softButtonClass}>
              다시 시도
            </button>
          </StateMessage>
        </div>
      )}

      {ready && (
        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-[2_1_600px] flex-col gap-6">
            <section aria-labelledby="table-title" className={`${card} px-7 pb-3 pt-7`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <h2 id="table-title" className="text-[20px] font-bold">
                  항목별 판정
                </h2>
                <p className="text-[14px] text-fit-muted">
                  판정 기준: {data.criteriaSource} · 기준일 {formatDate(data.criteriaDate)}
                  {data.sourceUrl && (
                    <>
                      {' · '}
                      <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-fit-deep underline underline-offset-2">
                        공고 원문<span className="sr-only"> (새 탭)</span>
                      </a>
                    </>
                  )}
                </p>
              </div>
              <EligibilityTable items={data.items} />
            </section>

            {failedItems.length > 0 && (
              <section role="alert" aria-labelledby="failed-title" className="rounded-[18px] border border-error/30 bg-error-container/50 p-7">
                <h2 id="failed-title" className="text-[18px] font-bold text-on-error-container">
                  기준에 맞지 않는 항목 {failedItems.length}개
                </h2>
                <ul className="mt-3 flex flex-col gap-2 text-[15px] text-on-error-container">
                  {failedItems.map((item) => (
                    <li key={item.key}>
                      <span className="font-semibold">{item.label}</span> · {item.reason}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.additionalReview.length > 0 && <ReviewList reviews={data.additionalReview} />}
          </div>

          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-6 lg:sticky lg:top-6">
            <NextStepCard canProceed={canProceed} onRecommend={goToRecommend} onEdit={goBackToCondition} />
            <PolicyRecommendation condition={condition} />
          </aside>
        </div>
      )}
    </div>
  )
}

export default function ResultPage() {
  const { state, key } = useLocation()
  const condition = state?.condition

  // 폼을 거치지 않고 직접 들어온 경우(새로고침 포함 state 유실) 조건 입력으로 돌려보낸다
  if (!condition) return <Navigate to="/" replace />

  return <ResultContent key={key} condition={condition} />
}
