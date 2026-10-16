import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { checkEligibility } from '../api/eligibility.js'
import StateMessage, { softButtonClass } from '../components/StateMessage.jsx'
import StepTracker from '../components/StepTracker.jsx'
import EligibilityTable from '../components/result/EligibilityTable.jsx'
import { formatDate } from '../utils/format.js'

const TYPE_LABELS = {
  'happy-youth': '행복주택 청년계층',
}

const FALLBACK_ERROR_MESSAGE = '자격 판정에 실패했어요. 잠시 후 다시 시도해 주세요.'

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
  const typeLabel = TYPE_LABELS[data.type] ?? data.type
  const failed = data.items.filter((item) => item.verdict === 'not_met').length
  if (data.status === 'not_met') {
    return {
      title: `${typeLabel}, 기준에 맞지 않는 항목이 있어요`,
      subtitle: `검사한 ${data.assessedCount}개 항목 중 ${failed}개가 기준에 맞지 않아요.`,
    }
  }
  if (data.status === 'met') {
    return {
      title: `${typeLabel}, 등록된 기준을 모두 충족했어요`,
      subtitle: `검사한 ${data.assessedCount}개 항목을 모두 충족했습니다. 실제 신청 자격은 공고문에서 확인하세요.`,
    }
  }
  // needs_review: 검사한 항목에 미충족은 없지만 추가 확인이 남았다. '신청 가능'이라고 하지 않는다.
  return {
    title: `${typeLabel}, 기본 조건은 충족했어요`,
    subtitle: '검사한 항목에는 미충족이 없어요. 아직 확인이 필요한 항목은 아래 목록을 공고문에서 확인하세요.',
  }
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
  // 미충족 항목이 있으면 막고, 추가 확인(needs_review)만 남은 경우는 참고용 주택 탐색으로 넘어갈 수 있다
  const canProceed = status === 'success' && !isEmpty && data.status !== 'not_met'
  const failedItems = status === 'success' ? data.items.filter((item) => item.verdict === 'not_met') : []

  const retry = () => {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }
  const goBackToCondition = () => navigate('/', { state: { condition } })
  const goToRecommend = () => navigate('/recommend', { state: { condition } })

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
      <div className="grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-11">
        <section className="flex flex-col gap-6 lg:col-span-5">
          <div>
            <h1 className="mb-3 break-keep text-[32px] font-bold leading-[1.22] tracking-tight text-ink lg:text-[44px]">
              {title}
            </h1>
            <p className="max-w-md text-[15.5px] leading-relaxed text-subtle">{subtitle}</p>
          </div>
          <StepTracker current={2} />
          <div className="flex flex-col gap-1.5 text-xs text-subtle">
            <p className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                info
              </span>
              실제 신청 자격은 공고문에서 최종 확인하세요.
            </p>
            {status === 'success' && (
              <p className="pl-[22px]">
                판정 기준: {data.criteriaSource} · 기준일 {formatDate(data.criteriaDate)}
                {data.sourceUrl && (
                  <>
                    {' · '}
                    <a
                      href={data.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-secondary underline hover:text-on-surface"
                    >
                      공고 원문
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
        </section>

        <section className="lg:col-span-7" aria-busy={status === 'loading'}>
          <div className="flex flex-col gap-3.5 rounded-[20px] border border-line-soft bg-white p-6 shadow-card">
            <div className="flex items-center gap-2 border-b border-line-soft pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
              <h2 className="text-[17px] font-bold text-ink">판정 근거</h2>
            </div>

            {status === 'loading' && <StateMessage variant="loading" message="자격을 판정하고 있어요…" />}

            {status === 'error' && (
              <StateMessage variant="error" message={message}>
                <button type="button" onClick={retry} className={softButtonClass}>
                  다시 시도
                </button>
              </StateMessage>
            )}

            {isEmpty && (
              <StateMessage variant="empty" message="판정할 항목을 받지 못했어요. 잠시 후 다시 시도해 주세요.">
                <button type="button" onClick={retry} className={softButtonClass}>
                  다시 시도
                </button>
              </StateMessage>
            )}

            {status === 'success' && !isEmpty && (
              <>
                <EligibilityTable items={data.items} />

                {failedItems.length > 0 && (
                  <div
                    role="alert"
                    className="rounded-xl bg-error-container px-4 py-3 text-[14px] text-on-error-container"
                  >
                    <p className="mb-1 font-semibold">충족하지 못한 항목 {failedItems.length}개</p>
                    <ul className="list-disc space-y-0.5 pl-5">
                      {failedItems.map((item) => (
                        <li key={item.key}>
                          <span className="font-semibold">{item.label}</span> · {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.additionalReview.length > 0 && (
                  <div className="rounded-xl bg-surface-container-low px-4 py-3 text-[14px] text-muted">
                    <p className="mb-1 font-semibold text-ink">추가로 확인할 항목 {data.additionalReview.length}개</p>
                    <ul className="list-disc space-y-0.5 pl-5">
                      {groupReviews(data.additionalReview).map(({ label, reasons }) =>
                        reasons.length === 1 ? (
                          <li key={label}>
                            <span className="font-semibold">{label}</span> · {reasons[0]}
                          </li>
                        ) : (
                          <li key={label}>
                            <span className="font-semibold">{label}</span> {reasons.length}건
                            <ul className="list-[circle] space-y-0.5 pl-5">
                              {reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-2 border-t border-line-soft pt-3">
              {status === 'success' && !isEmpty && data.status === 'not_met' && (
                <p className="text-[13px] text-muted">
                  기준에 맞지 않는 항목이 있으면 맞춤 주택을 볼 수 없어요. 조건을 수정해 다시 확인해 보세요.
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBackToCondition}
                  className={softButtonClass}
                >
                  조건 수정하기
                </button>
                <button
                  type="button"
                  onClick={goToRecommend}
                  disabled={!canProceed}
                  className="flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-base font-bold text-accent-ink shadow-md shadow-accent/30 transition-all hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-accent disabled:active:scale-100"
                >
                  <span>맞춤 주택 보기</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
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
