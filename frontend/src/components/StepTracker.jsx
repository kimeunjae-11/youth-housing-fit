const STEPS = ['조건 입력', '자격 판정', '참고 주택']

// current: 1~3. detail: 현재 단계 옆에 붙는 보조 글자 (예: 조건 입력의 세부 단계). 이전 단계는 완료 표시, 이후 단계는 흐리게
export default function StepTracker({ current, detail }) {
  return (
    <ol className="flex flex-col">
      {STEPS.map((label, index) => {
        const step = index + 1
        const active = step === current
        const done = step < current

        return (
          <li key={label} aria-current={active ? 'step' : undefined}>
            {index > 0 && <div className="-my-0.5 ml-[1.1rem] h-3.5 w-0.5 bg-line" aria-hidden="true" />}
            <div
              className={`flex items-center gap-3.5 rounded-2xl ${
                active ? 'bg-white p-3 ring-1 ring-stage-line/50' : 'p-2.5'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] ${
                  active || done
                    ? 'bg-accent font-bold text-accent-ink'
                    : 'bg-surface-container font-semibold text-muted'
                }`}
              >
                {done ? (
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    check
                  </span>
                ) : (
                  step
                )}
              </div>
              <span
                className={
                  active
                    ? 'text-[15px] font-bold text-ink'
                    : done
                      ? 'text-[14.5px] font-medium text-ink'
                      : 'text-[14px] font-medium text-muted'
                }
              >
                {label}
                {active && detail && (
                  <span className="ml-2 text-[13px] font-normal text-muted">{detail}</span>
                )}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
