import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { fetchRecommendations } from '../api/recommendations.js'
import StateMessage, { softButtonClass } from '../components/StateMessage.jsx'
import StepTracker from '../components/StepTracker.jsx'
import ListingCard from '../components/recommend/ListingCard.jsx'
import { REGION_OPTIONS } from '../constants/condition.js'
import { formatDate } from '../utils/format.js'

const FALLBACK_ERROR_MESSAGE = '추천 공고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'

// 값이 null(미확인·공고 예정)인 공고는 정렬에서 맨 뒤로 보낸다
const byNullsLast = (a, b, compare) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return compare(a, b)
}

const ascending = (x, y) => x - y

// 임대료는 사용자에게 적용되는 확정 금액을 먼저, 확정 전 목록은 요약 참고 가격 순으로 뒤에 둔다
const SORT_OPTIONS = [
  {
    value: 'rent',
    label: '월 임대료 낮은 순',
    compare: (a, b) =>
      byNullsLast(a.applicableRent, b.applicableRent, ascending) ||
      byNullsLast(a.referenceRent, b.referenceRent, ascending),
  },
  { value: 'deposit', label: '보증금 낮은 순', compare: (a, b) => byNullsLast(a.deposit, b.deposit, ascending) },
  { value: 'area', label: '전용면적 넓은 순', compare: (a, b) => byNullsLast(a.area, b.area, (x, y) => y - x) },
  {
    value: 'deadline',
    label: '접수 마감일 순',
    compare: (a, b) => byNullsLast(a.recruitEnd, b.recruitEnd, (x, y) => x.localeCompare(y)),
  },
]

function getHeading(status, count, message) {
  if (status === 'loading') {
    return { title: '맞는 공고를 찾고 있어요', subtitle: '입력하신 조건으로 오산시 공고를 확인하는 중입니다.' }
  }
  if (status === 'error') {
    return { title: '공고를 불러오지 못했어요', subtitle: '조건은 그대로 두었으니 다시 시도해 보세요.' }
  }
  if (count === 0) {
    return { title: '맞는 공고가 아직 없어요', subtitle: '조건을 조금 바꾸면 다른 공고가 보일 수 있어요.' }
  }
  // 자격 판정과 별개인 지역·월세 탐색 결과다. '신청 가능'으로 보이는 문구는 쓰지 않는다.
  return {
    title: '참고용 공고를 찾았어요',
    subtitle: message || '지역·월세에 맞는 참고용 목록이에요. 자격 충족이나 현재 신청 가능을 뜻하지 않아요.',
  }
}

const chipBase = 'rounded-full px-3 py-1 text-xs font-medium'

function RecommendContent({ condition }) {
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ status: 'loading' })
  const [sortKey, setSortKey] = useState('rent')

  useEffect(() => {
    let cancelled = false
    fetchRecommendations(condition)
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
  const items = data?.items

  const sortedItems = useMemo(() => {
    if (!items) return []
    const { compare } = SORT_OPTIONS.find((option) => option.value === sortKey)
    return [...items].sort(compare)
  }, [items, sortKey])

  // 모든 공고에 똑같이 붙는 안내 문장은 목록 위에 한 번만 보여주고 카드에서는 뺀다
  const commonCautions = useMemo(() => {
    if (!items || items.length < 2) return []
    return items[0].cautions.filter((caution) => items.every((item) => item.cautions.includes(caution)))
  }, [items])

  const lowestRent = useMemo(() => {
    const rents = (items ?? []).map((item) => item.applicableRent).filter((rent) => rent != null)
    return rents.length > 1 ? Math.min(...rents) : null
  }, [items])

  const retry = () => {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }
  const goBackToCondition = () => navigate('/', { state: { condition } })

  const { title, subtitle } = getHeading(status, items?.length, data?.message)
  const regionLabel = REGION_OPTIONS.find((option) => option.value === condition.region)?.label

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
      <div className="grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-[430px_minmax(0,1fr)]">
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="mb-3 break-keep text-[32px] font-bold leading-[1.22] tracking-tight text-ink lg:text-[44px]">
              {title}
            </h1>
            <p className="max-w-md text-[15.5px] leading-relaxed text-muted">{subtitle}</p>
          </div>
          <StepTracker current={3} />
        </section>

        <section className="flex min-w-0 flex-col gap-3" aria-busy={status === 'loading'}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-1 text-xs">
            <ul className="flex flex-wrap items-center gap-2">
              <li className={`${chipBase} flex items-center gap-1 bg-surface-container-low font-semibold text-primary`}>
                <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                  check
                </span>
                행복주택
              </li>
              {regionLabel && (
                <li className={`${chipBase} border border-surface-variant bg-white text-on-surface`}>{regionLabel}</li>
              )}
              {condition.max_rent != null && (
                <li className={`${chipBase} border border-surface-variant bg-white text-on-surface`}>
                  월 임대료 {condition.max_rent.toLocaleString('ko-KR')}만원 이하
                </li>
              )}
            </ul>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBackToCondition}
                className="inline-flex items-center gap-1 text-xs font-semibold text-secondary underline transition-colors hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                  tune
                </span>
                조건 바꾸기
              </button>
              {status === 'success' && items.length > 0 && (
                <div className="relative">
                  <span
                    className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-secondary"
                    aria-hidden="true"
                  >
                    sort
                  </span>
                  <select
                    aria-label="정렬 기준"
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value)}
                    className="cursor-pointer appearance-none rounded-xl border border-surface-variant bg-white py-1.5 pl-9 pr-9 text-xs font-medium text-on-surface shadow-sm transition-all hover:bg-surface focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span
                    className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-secondary"
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </div>
              )}
            </div>
          </div>

          {status === 'loading' && <StateMessage variant="loading" bordered message="공고를 불러오고 있어요…" />}

          {status === 'error' && (
            <StateMessage variant="error" bordered message={message}>
              <button type="button" onClick={retry} className={softButtonClass}>
                다시 시도
              </button>
              <button type="button" onClick={goBackToCondition} className={softButtonClass}>
                조건 수정하기
              </button>
            </StateMessage>
          )}

          {status === 'success' && items.length === 0 && (
            <StateMessage
              variant="empty"
              bordered
              message={
                condition.region !== 'all'
                  ? '선택한 지역에 맞는 공고가 없어요. 공고 데이터에 동 정보가 아직 없을 수 있으니 희망 지역을 "오산시 전체"로 바꿔 보세요.'
                  : condition.max_rent != null
                    ? '조건에 맞는 공고가 없어요. 월 임대료 상한을 높이거나 다른 조건으로 다시 찾아보세요.'
                    : '조건에 맞는 공고가 없어요. 다른 조건으로 다시 찾아보세요.'
              }
            >
              <button type="button" onClick={goBackToCondition} className={softButtonClass}>
                조건 수정하기
              </button>
            </StateMessage>
          )}

          {status === 'success' && items.length > 0 && (
            <>
              <p className="sr-only" role="status">
                참고용 공고 {items.length}건
              </p>
              {commonCautions.length > 0 && (
                <ul className="list-disc space-y-0.5 rounded-xl bg-surface-container-low px-4 py-2.5 pl-8 text-xs text-muted">
                  {commonCautions.map((caution) => (
                    <li key={caution}>{caution}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-2">
                {sortedItems.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={{ ...listing, cautions: listing.cautions.filter((caution) => !commonCautions.includes(caution)) }}
                    isLowestRent={lowestRent != null && listing.applicableRent === lowestRent}
                    budgetWon={condition.max_rent != null ? condition.max_rent * 10000 : null}
                  />
                ))}
              </div>
            </>
          )}

          {status === 'success' && (
            <p className="px-1 pt-1 text-right text-xs text-subtle">공고 데이터 기준일 {formatDate(data.dataDate)}</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default function RecommendPage() {
  const { state, key } = useLocation()
  const condition = state?.condition

  // 폼을 거치지 않고 직접 들어온 경우(새로고침 포함 state 유실) 조건 입력으로 돌려보낸다
  if (!condition) return <Navigate to="/" replace />

  return <RecommendContent key={key} condition={condition} />
}
