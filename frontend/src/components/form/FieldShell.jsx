// 라벨·필수 표시·힌트·에러 문구를 감싸는 공통 껍데기
export function RequiredMark() {
  return (
    <span className="text-accent" aria-hidden="true">
      *
    </span>
  )
}

export function FieldMessage({ id, hint, error }) {
  if (error) {
    return (
      <p id={id} role="alert" className="pl-0.5 text-[13px] font-medium text-error">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={id} className="pl-0.5 text-[13px] text-muted">
        {hint}
      </p>
    )
  }
  return null
}

export const labelClass = 'flex items-center gap-1 text-[13px] font-semibold text-ink'
