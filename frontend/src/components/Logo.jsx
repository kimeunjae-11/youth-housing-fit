// 청년주거 핏 로고. "핏"의 ㅍ을 처마 지붕·두 기둥·바닥으로 그린 건물 모양 + 가운데 앰버색 문.
// 색: base(모카/크림) + accent(번트 앰버) 두 가지만 쓴다.

export function LogoMark({ size = 24, base = '#5A4033', accent = '#B5581C', title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d="M6 15 L10 8 H38 L42 15 Z" fill={base} />
      <rect x="13" y="15" width="6" height="21" fill={base} />
      <rect x="29" y="15" width="6" height="21" fill={base} />
      <rect x="21.5" y="26" width="5" height="10" rx="1" fill={accent} />
      <rect x="5" y="36" width="38" height="5" rx="1" fill={base} />
    </svg>
  )
}

// 헤더용 로고 (아이콘 + 세리프 글자). 링크·버튼 안에 넣어 쓴다.
export default function Logo({ size = 24, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-serif text-[19px] font-semibold text-fit-ink ${className}`}>
      <LogoMark size={size} />
      청년주거 핏
    </span>
  )
}
