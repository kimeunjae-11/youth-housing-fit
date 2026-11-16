// 버튼 안 화살표. 부모에 group 클래스가 있으면 호버 장치에서 2px 움직인다.
export default function ArrowIcon() {
  return (
    <svg
      className="transition-transform duration-150 ease-out [@media(hover:hover)]:group-hover:translate-x-0.5"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
