// 라벨·필수 표시·힌트·에러 문구를 감싸는 공통 껍데기
export function RequiredMark() {
  return (
    <span className="text-fit-amber" aria-hidden="true">
      *
    </span>
  )
}

export function OptionalMark() {
  return <span className="ml-1 text-[13px] font-normal text-fit-muted">선택</span>
}

export function FieldMessage({ id, hint, error }) {
  if (error) {
    return (
      <p id={id} role="alert" className="text-[13px] font-medium text-error">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={id} className="text-[13px] leading-[1.5] text-fit-muted">
        {hint}
      </p>
    )
  }
  return null
}

export const labelClass = 'flex items-center gap-1 text-[15px] font-semibold text-fit-ink'
