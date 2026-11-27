import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { fetchRecommendations, fetchRankedRecommendations } from '../api/recommendations.js'
import StateMessage, { softButtonClass } from '../components/StateMessage.jsx'
import ListingCard from '../components/recommend/ListingCard.jsx'
import { LISTING_GRID } from '../components/recommend/listingGrid.js'
import TopRecommendations from '../components/recommend/TopRecommendations.jsx'
import { card, sectionLabel, serifTitle } from '../components/ui.js'
import { REGION_OPTIONS } from '../constants/condition.js'
import { formatDate } from '../utils/format.js'
import { SCORE_LABELS } from '../utils/scoreLabels.js'
import { buildRankingNotices } from '../utils/rankingNotices.js'
import { buildRankingInput } from '../utils/rankingInput.js'

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

function getHeading(status, count) {
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
    title: '내 조건에 맞는 추천 주택',
    subtitle: '자격을 충족하고 접수 중인 공고 중, 내가 고른 우선순위로 매긴 점수가 높은 순서예요.',
  }
}

const chip = 'flex items-center gap-1.5 rounded-full border border-fit-line2 bg-white px-3.5 py-2 text-[14px]'

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

  // 맞춤 추천 TOP 3. 참고용 공고 목록을 받은 뒤 추천 점수 API에 넘긴다.
  // TODO: 공고별 자격판정 API가 나오면 judgments 를 채우고, 엑셀 공고가 연결되면 notices 입력을 바꾼다.
  const [rankingState, setRankingState] = useState({ status: 'loading' })
  const [rankingAttempt, setRankingAttempt] = useState(0)
  const rankingWeights = useMemo(() => buildRankingInput(condition).weights, [condition])

  useEffect(() => {
    if (!items) return
    let cancelled = false
    fetchRankedRecommendations(buildRankingNotices(items), {}, condition)
      .then((result) => {
        if (!cancelled) setRankingState({ status: 'success', result })
      })
      .catch((error) => {
        if (!cancelled) setRankingState({ status: 'error', message: error?.message })
      })
    return () => {
      cancelled = true
    }
  }, [items, condition, rankingAttempt])

  const retryRanking = () => {
    setRankingState({ status: 'loading' })
    setRankingAttempt((count) => count + 1)
  }

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
  const goBackToCondition = () => navigate('/condition', { state: { condition } })

  const sortSelect = (
    <label className="flex items-center gap-2 text-[14px] text-fit-muted">
      정렬
      <span className="relative">
        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value)}
          className="min-h-[44px] cursor-pointer appearance-none rounded-[10px] border border-fit-border bg-white py-1.5 pl-3 pr-9 text-[15px] text-fit-ink focus:border-fit-amber focus:outline-none focus:ring-2 focus:ring-fit-amber/25"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </label>
  )

  const { title, subtitle } = getHeading(status, items?.length)
  const regionLabel = REGION_OPTIONS.find((option) => option.value === condition.region)?.label
  // 가중치가 있는 항목만 큰 순서로 (우선순위를 고르지 않았으면 기본 가중치)
  const weightChips = Object.entries(rankingWeights)
    .filter(([key, weight]) => weight > 0 && SCORE_LABELS[key])
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-[88px] pt-14" aria-busy={status === 'loading'}>
      <section aria-labelledby="recommend-title" className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0 flex-[1_1_520px]">
          <p className={sectionLabel}>추천 주택 · 참고용</p>
          <h1 id="recommend-title" className={`${serifTitle} mt-3 break-keep text-[clamp(2rem,3.4vw,2.875rem)] leading-[1.3]`}>
            {title}
          </h1>
          <p className="mt-3.5 max-w-[52ch] text-[17px] leading-[1.7] text-fit-muted">{subtitle}</p>
        </div>
        <div>
          <p className="mb-2 text-[13px] text-fit-muted">내 조건 · 우선순위 가중치</p>
          <ul className="flex flex-wrap gap-1.5">
            <li className={chip}>행복주택{regionLabel && ` · ${regionLabel}`}</li>
            {condition.max_rent != null && <li className={chip}>월 임대료 {condition.max_rent.toLocaleString('ko-KR')}만원 이하</li>}
            {weightChips.map(([key, weight], index) => (
              <li key={key} className={chip}>
                <b className="text-fit-amber">{index + 1}</b>
                {SCORE_LABELS[key]} {weight}%
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-14">
        {status === 'success' && items.length > 0 && (
          <TopRecommendations
            state={rankingState}
            weights={rankingWeights}
            onRetry={retryRanking}
            onEdit={goBackToCondition}
            referenceCount={items.length}
          />
        )}

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
          <section id="reference" aria-labelledby="reference-title" className={`${card} scroll-mt-6 px-7 pb-2 pt-7`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="reference-title" className="text-[20px] font-bold" role="status">
                  참고용 공고 <span className="text-fit-deep">{items.length}건</span>
                </h2>
                <p className="mt-1.5 text-[15px] leading-[1.6] text-fit-muted">
                  지역과 월 임대료 상한으로만 골랐어요. 자격 충족이나 현재 신청 가능을 뜻하지 않아요.
                </p>
              </div>
              {sortSelect}
            </div>
            {commonCautions.length > 0 && (
              <ul className="mt-4 list-disc space-y-0.5 rounded-xl bg-fit-bg px-4 py-3 pl-8 text-[13px] text-fit-muted">
                {commonCautions.map((caution) => (
                  <li key={caution}>{caution}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 overflow-x-auto">
              <div aria-hidden="true" className={`hidden border-b border-fit-line2 px-3.5 py-2.5 text-[13px] text-fit-muted ${LISTING_GRID}`}>
                <span>단지</span>
                <span>전용</span>
                <span className="text-right">보증금</span>
                <span className="text-right">월 임대료</span>
                <span>상태</span>
                <span className="w-[60px]" />
              </div>
              {sortedItems.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={{ ...listing, cautions: listing.cautions.filter((caution) => !commonCautions.includes(caution)) }}
                  isLowestRent={lowestRent != null && listing.applicableRent === lowestRent}
                  budgetWon={condition.max_rent != null ? condition.max_rent * 10000 : null}
                />
              ))}
            </div>
            <p className="border-t border-fit-line px-3.5 pb-5 pt-3.5 text-[13px] text-fit-muted">
              금액은 공고의 요약 기준값이에요. 공고 데이터 기준일 {formatDate(data.dataDate)}
            </p>
          </section>
        )}
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
