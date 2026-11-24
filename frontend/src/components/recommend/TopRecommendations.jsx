import StateMessage, { softButtonClass } from '../StateMessage.jsx'
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
 *           weights: Record<string, number>, onRetry: () => void }} props
 */
export default function TopRecommendations({ state, weights, onRetry }) {
  if (state.status === 'idle') return null

  const top3 = state.result?.top3 ?? []
  const summary = state.status === 'success' ? excludedSummary(state.result) : null

  return (
    <section aria-labelledby="top3-heading" aria-busy={state.status === 'loading'} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 px-1">
        <h2 id="top3-heading" className="text-lg font-semibold text-accent-ink">
          맞춤 추천 TOP 3
        </h2>
        <p className="text-[13px] text-muted">자격 충족 · 접수 중인 공고를 희망 조건 점수로 골랐어요</p>
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
        <StateMessage variant="empty" bordered message="지금 추천할 수 있는 공고가 없어요">
          <p className="max-w-sm text-[14px] text-muted">
            {summary ? `확인한 공고: ${summary}. ` : ''}아래 참고용 목록에서 지난 공고 조건을 살펴볼 수 있어요.
          </p>
        </StateMessage>
      )}

      {state.status === 'success' && top3.length > 0 && (
        <>
          <ol className="flex flex-col gap-2">
            {top3.map((notice, index) => (
              <li key={notice.id}>
                <RankedNoticeCard notice={notice} rank={index + 1} weights={weights} />
              </li>
            ))}
          </ol>
          <p className="px-1 text-[13px] text-muted">
            점수는 희망 조건에 얼마나 가까운지를 뜻해요. 최종 자격은 공고문에서 확인하세요.
          </p>
        </>
      )}
    </section>
  )
}
