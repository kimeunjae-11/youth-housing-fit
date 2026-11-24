import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

// 시안: 자격 진단 탭은 조건 입력(/)·판정 결과(/result)에서 활성, 추천 주택(/recommend)에서는 비활성
const DIAGNOSIS_PATHS = ['/condition', '/result']

const tabBase =
  'inline-flex min-h-[44px] items-center rounded-full px-4 text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink'

export default function Layout() {
  const { pathname } = useLocation()
  const diagnosisActive = DIAGNOSIS_PATHS.includes(pathname)

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="h-14 shrink-0 border-b border-line/80 bg-canvas">
        <div className="flex h-full w-full items-center justify-between px-6 sm:px-8 lg:px-12 xl:px-16">
          <Link
            to="/"
            className="rounded text-[17px] font-bold tracking-[-0.02em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
          >
            청년주거 핏
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/condition"
              className={() =>
                diagnosisActive
                  ? `${tabBase} bg-accent-soft font-semibold text-ink`
                  : `${tabBase} font-medium text-muted hover:bg-accent-soft hover:text-ink`
              }
            >
              자격 진단
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="w-full shrink-0 border-t border-line/60 bg-canvas py-4">
        <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 px-6 text-[13px] text-muted sm:px-8 lg:px-12 xl:px-16">
          <span className="font-bold text-ink">청년주거 핏</span>
          <span>·</span>
          <span>데이터 출처: LH·GH 행복주택 모집공고</span>
          <span>·</span>
          <span>판정 결과는 참고용이며 최종 자격은 공고문에서 확인하세요.</span>
        </div>
      </footer>
    </div>
  )
}
