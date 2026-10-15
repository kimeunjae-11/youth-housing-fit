function Verdict({ verdict }) {
  if (verdict === 'met') {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-ok">
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          check
        </span>
        충족
      </span>
    )
  }
  if (verdict === 'not_met') {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-error">
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          close
        </span>
        미충족
      </span>
    )
  }
  // unknown: 입력이 없거나 심사 범위를 알 수 없어 충족 여부를 정하지 못한 항목. 충족으로 보여주지 않는다.
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-subtle">
      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
        help
      </span>
      확인 필요
    </span>
  )
}

// 항목별 판정 표. 좁은 화면에서는 항목·판정이 윗줄, 내 입력·기준이 아랫줄로 쌓인다.
export default function EligibilityTable({ items }) {
  return (
    <div role="table" aria-label="판정 근거">
      <div
        role="row"
        className="hidden grid-cols-12 rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[15px] font-semibold text-muted md:grid"
      >
        <span role="columnheader" className="col-span-3">
          항목
        </span>
        <span role="columnheader" className="col-span-3">
          내 입력
        </span>
        <span role="columnheader" className="col-span-4">
          기준
        </span>
        <span role="columnheader" className="col-span-2 text-right">
          판정
        </span>
      </div>

      <div role="rowgroup" className="divide-y divide-line-soft">
        {items.map((item) => (
          <div
            key={item.key}
            role="row"
            className="grid grid-cols-2 gap-y-1 px-3.5 py-3 md:grid-cols-12 md:items-center"
          >
            <span role="cell" className="col-span-1 text-[15px] font-medium text-ink md:col-span-3">
              {item.label}
            </span>
            <span
              role="cell"
              className="order-2 col-span-1 text-right md:order-4 md:col-span-2"
            >
              <Verdict verdict={item.verdict} />
            </span>
            <span
              role="cell"
              className="order-3 col-span-1 text-[15.5px] font-bold text-ink md:order-2 md:col-span-3"
            >
              {item.input}
            </span>
            <span
              role="cell"
              className="order-4 col-span-1 text-[15px] text-muted md:order-3 md:col-span-4"
            >
              {item.criterion}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
