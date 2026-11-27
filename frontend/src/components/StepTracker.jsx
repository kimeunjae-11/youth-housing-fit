const STEPS = ['조건 입력', '자격 판정', '추천 주택']

// 헤더 가운데의 가로 단계 표시. current: 1~3. 지난 단계는 체크, 지금 단계는 앰버, 남은 단계는 테두리만.
export default function StepTracker({ current }) {
  return (
    <ol aria-label="진행 단계" className="flex flex-wrap items-center gap-2">
      {STEPS.map((label, index) => {
        const step = index + 1
        const active = step === current
        const done = step < current

        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-2 text-[14px] ${active ? 'font-semibold text-fit-ink' : 'text-fit-muted'}`}
          >
            <span
              className={`flex size-[26px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                done
                  ? 'bg-fit-ink text-fit-bg'
                  : active
                    ? 'bg-fit-amber text-white'
                    : 'border border-fit-border font-medium text-fit-muted'
              }`}
            >
              {done ? (
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                step
              )}
            </span>
            {label}
            {done && <span className="sr-only">(완료)</span>}
            {index < STEPS.length - 1 && <span aria-hidden="true" className="ml-1 hidden h-px w-8 bg-fit-border sm:block" />}
          </li>
        )
      })}
    </ol>
  )
}
