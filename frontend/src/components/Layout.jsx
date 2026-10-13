import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

// 시안: 자격 진단 탭은 조건 입력(/)·판정 결과(/result)에서 활성, 맞춤 추천(/recommend)에서는 비활성
const DIAGNOSIS_PATHS = ['/', '/result']

const tabBase = 'rounded-full px-4 py-1.5 text-sm transition-all'

export default function Layout() {
  const { pathname } = useLocation()
  const diagnosisActive = DIAGNOSIS_PATHS.includes(pathname)

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="z-30 w-full shrink-0 border-b border-line/80 bg-canvas/90 backdrop-blur-sm">
        <div className="flex h-16 w-full items-center justify-between px-12 md:px-16">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform group-hover:scale-105">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                roofing
              </span>
            </div>
            <span className="text-[19px] font-bold tracking-tight text-ink">
              청년주거 핏
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              className={() =>
                diagnosisActive
                  ? `${tabBase} bg-accent-soft font-semibold text-ink`
                  : `${tabBase} font-medium text-muted hover:bg-surface-container-low hover:text-ink`
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

      <footer className="w-full shrink-0 border-t border-line/60 bg-canvas py-3">
        <div className="flex w-full items-center gap-2 px-12 text-xs text-subtle md:px-16">
          <span className="font-bold text-ink">청년주거 핏</span>
          <span>·</span>
          <span>이용약관</span>
          <span>·</span>
          <span>개인정보처리방침</span>
        </div>
      </footer>
    </div>
  )
}
