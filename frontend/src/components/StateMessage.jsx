// /result, /recommend 가 함께 쓰는 로딩·에러·빈 결과 안내.
// variant 에 따라 아이콘·접근성 role 이 정해지고, 버튼은 children 으로 받는다.

export const softButtonClass =
  'rounded-full bg-accent-soft px-6 py-2.5 text-sm font-semibold text-accent-ink transition-all hover:bg-primary-fixed active:scale-[0.98]'

const VARIANTS = {
  loading: { icon: 'progress_activity', iconClass: 'animate-spin text-accent', role: 'status' },
  error: { icon: 'error', iconClass: 'text-error', role: 'alert' },
  empty: { icon: 'search_off', iconClass: 'text-subtle', role: 'status' },
}

// bordered: 카드 밖에서 단독으로 쓸 때 흰 카드 모양을 입힌다 (이미 카드 안이면 생략)
export default function StateMessage({ variant, message, bordered = false, children }) {
  const { icon, iconClass, role } = VARIANTS[variant]

  return (
    <div
      role={role}
      className={`flex flex-col items-center gap-3 px-6 py-14 text-center ${
        bordered ? 'rounded-[20px] border border-line-soft bg-white shadow-listing' : ''
      }`}
    >
      <span className={`material-symbols-outlined text-[32px] ${iconClass}`} aria-hidden="true">
        {icon}
      </span>
      <p className={`max-w-sm text-[15px] ${variant === 'loading' ? 'text-subtle' : 'font-medium text-ink'}`}>
        {message}
      </p>
      {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}
