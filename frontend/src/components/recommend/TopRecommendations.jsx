import { useState } from 'react'
import heroDusk from '../../assets/hero-dusk.webp'
import StateMessage, { softButtonClass } from '../StateMessage.jsx'
import { btnPrimary, btnSecondary, card, serifTitle } from '../ui.js'
import RankedNoticeCard from './RankedNoticeCard.jsx'

// 추천 후보에서 빠진 이유별 공고 수를 한 문장으로. 0건인 이유는 생략한다.
function excludedSummary(result) {
  const parts = [
    ['접수 마감', result.closed?.length ?? 0],
    ['공고별 자격 확인 전', result.unverified?.length ?? 0],
    ['추가 확인 필요', result.needs_review?.length ?? 0],
    ['자격 미충족', result.ineligible?.length ?? 0],
  ].filter(([, count]) => count > 0)
  if (parts.length === 0) return null
  return parts.map(([label, count]) => `${label} ${count}건`).join(', ')
}

/**
 * 맞춤 추천 TOP 3
 * 자격 판정이 충족이고 지금 접수 중인 공고만 점수 순으로 보여준다. 아래 참고용 목록과 섞이지 않게 따로 묶는다.
 * @param {{ state: { status: 'idle' | 'loading' | 'success' | 'error', result?: object, message?: string },
 *           weights: Record<string, number>, onRetry: () => void, onEdit: () => void, referenceCount: number }} props
 */
export default function TopRecommendations({ state, weights, onRetry, onEdit, referenceCount }) {
  // 1위는 펼친 채로 시작한다
  const [open, setOpen] = useState({ 0: true })
  if (state.status === 'idle') return null

  const top3 = state.result?.top3 ?? []
  const summary = state.status === 'success' ? excludedSummary(state.result) : null
  const toReference = () => document.getElementById('reference')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section aria-labelledby="top3-heading" aria-busy={state.status === 'loading'} className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
          <h2 id="top3-heading" className="text-[20px] font-bold">
            추천 TOP 3
          </h2>
          <p className="text-[13px] text-fit-muted">자격을 충족하고 접수 중인 공고만 골랐어요 · 원 안 숫자는 항목별 점수, 오른쪽은 가중평균</p>
        </div>
        {referenceCount > 0 && (
          <a href="#reference" className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-fit-deep underline-offset-4 hover:underline">
            참고용 공고 {referenceCount}건 보기
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </a>
        )}
      </div>

      {state.status === 'loading' && <StateMessage variant="loading" bordered message="맞춤 추천을 계산하고 있어요…" />}

      {state.status === 'error' && (
        <StateMessage variant="error" bordered message={state.message || '맞춤 추천을 불러오지 못했어요.'}>
          <button type="button" onClick={onRetry} className={softButtonClass}>
            다시 시도
          </button>
        </StateMessage>
      )}

      {state.status === 'success' && top3.length === 0 && (
        <div role="status" className={`${card} relative overflow-hidden rounded-[20px]`}>
          <img
            src={heroDusk}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
            style={{ WebkitMaskImage: 'linear-gradient(to right,transparent 30%,#000 100%)', maskImage: 'linear-gradient(to right,transparent 30%,#000 100%)' }}
          />
          <div className="relative max-w-[560px] px-7 py-11 sm:px-14">
            <h3 className={`${serifTitle} text-[30px] leading-[1.35]`}>
              <span className="block">지금 추천할 수 있는</span>
              <span className="block">공고가 없어요</span>
            </h3>
            <p className="mt-3 text-[16px] leading-[1.7] text-fit-muted">
              TOP 3는 자격을 충족하고 접수 중인 공고만 골라요. 지금 연결된 공고 중에는 해당하는 공고가 없어요.
            </p>
            {summary && (
              <p className="mt-4 inline-flex rounded-full bg-fit-line px-3 py-1.5 text-[14px] font-semibold text-fit-muted">
                후보에서 빠진 공고: {summary}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {referenceCount > 0 && (
                <button type="button" onClick={toReference} className={btnPrimary}>
                  참고용 공고 {referenceCount}건 보기
                </button>
              )}
              <button type="button" onClick={onEdit} className={btnSecondary}>
                조건 수정
              </button>
            </div>
          </div>
        </div>
      )}

      {state.status === 'success' && top3.length > 0 && (
        <>
          <ol className={`${card} overflow-hidden`}>
            {top3.map((notice, index) => (
              <li key={notice.id} className="border-t border-fit-line first:border-t-0">
                <RankedNoticeCard
                  notice={notice}
                  rank={index + 1}
                  weights={weights}
                  expanded={Boolean(open[index])}
                  onToggle={() => setOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
                />
              </li>
            ))}
          </ol>
          <p className="mt-3.5 text-[13px] text-fit-muted">
            점수는 항목별 0~100점의 가중평균이에요. 공고에 정보가 없는 항목은 0점이 아니라 계산에서 빠져요. 최종 자격은 공고문에서 확인하세요.
          </p>
        </>
      )}
    </section>
  )
}
