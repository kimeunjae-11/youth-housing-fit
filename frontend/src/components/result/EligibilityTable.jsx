// 판정 표시는 색 + 아이콘 + 글자를 함께 쓴다. 색만으로 구분하지 않는다.
export function VerdictIcon({ verdict }) {
  if (verdict === 'met') {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#4F6B3A" />
        <path d="M7.5 12.5l3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (verdict === 'not_met') {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#ba1a1a" />
        <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#B5581C" />
      <path d="M12 7v6M12 16.5v.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

const VERDICT = {
  met: { label: '충족', className: 'font-semibold text-fit-ok' },
  not_met: { label: '미충족', className: 'font-bold text-error' },
  // unknown: 입력이 없거나 심사 범위를 알 수 없어 충족 여부를 정하지 못한 항목. 충족으로 보여주지 않는다.
  unknown: { label: '확인 필요', className: 'font-bold text-fit-deep' },
}

function Verdict({ verdict }) {
  const { label, className } = VERDICT[verdict] ?? VERDICT.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 text-[16px] ${className}`}>
      <VerdictIcon verdict={verdict} />
      {label}
    </span>
  )
}

const cell = 'px-3 py-4'

// 항목별 판정 표. 좁은 화면에서는 항목·판정이 윗줄, 내 입력·기준이 아랫줄로 쌓인다.
export default function EligibilityTable({ items }) {
  return (
    <div role="table" aria-label="판정 근거" className="mt-4 text-[16px] [font-feature-settings:'tnum']">
      <div role="row" className="hidden grid-cols-[1.1fr_1fr_1.5fr_auto] border-b border-fit-line2 text-[13px] text-fit-muted md:grid">
        <span role="columnheader" className="px-3 py-2.5">항목</span>
        <span role="columnheader" className="px-3 py-2.5">내 입력</span>
        <span role="columnheader" className="px-3 py-2.5">기준</span>
        <span role="columnheader" className="px-3 py-2.5 text-right">판정</span>
      </div>
      <div role="rowgroup">
        {items.map((item) => (
          <div
            key={item.key}
            role="row"
            className={`grid grid-cols-2 border-b border-fit-line md:grid-cols-[1.1fr_1fr_1.5fr_auto] md:items-center ${
              item.verdict === 'met' ? '' : item.verdict === 'not_met' ? 'bg-error-container/40' : 'bg-fit-champagne'
            }`}
          >
            <span role="cell" className={`${cell} pb-1 font-semibold md:pb-4`}>{item.label}</span>
            <span role="cell" className={`${cell} order-2 pb-1 text-right md:order-4 md:pb-4`}>
              <Verdict verdict={item.verdict} />
            </span>
            <span role="cell" className={`${cell} order-3 pt-0 md:order-2 md:pt-4`}>{item.input}</span>
            <span role="cell" className={`${cell} order-4 pt-0 text-fit-muted md:order-3 md:pt-4`}>{item.criterion}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
