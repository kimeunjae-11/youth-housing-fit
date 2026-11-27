import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import StepTracker from './StepTracker.jsx'
import { btnPill, focusRing } from './ui.js'

const STEP_BY_PATH = { '/condition': 1, '/result': 2, '/recommend': 3 }

export default function Layout() {
  const { pathname, state } = useLocation()
  const navigate = useNavigate()
  const current = STEP_BY_PATH[pathname] ?? 1
  // 판정 결과·추천 주택에서는 입력값을 들고 조건 입력으로 돌아간다
  const canEdit = current > 1 && state?.condition

  return (
    <div className="flex min-h-screen flex-col bg-fit-bg text-fit-ink">
      <header className="border-b border-fit-line bg-white">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-2">
          <Link to="/" aria-label="청년주거 핏 메인으로" className={`inline-flex min-h-[44px] items-center rounded ${focusRing}`}>
            <Logo />
          </Link>
          <StepTracker current={current} />
          {canEdit ? (
            <button type="button" onClick={() => navigate('/condition', { state: { condition: state.condition } })} className={btnPill}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 20h4L19 9l-4-4L4 16z" />
              </svg>
              조건 수정
            </button>
          ) : (
            <span className="hidden w-[110px] sm:block" aria-hidden="true" />
          )}
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-fit-line2 px-6 py-6 text-center text-[13px] leading-[1.6] text-fit-muted">
        판정 결과는 입력값을 바탕으로 한 참고용이에요. 최종 자격은 공고문에서 확인하세요. · 데이터 출처: LH·GH 행복주택 모집공고
      </footer>
    </div>
  )
}
