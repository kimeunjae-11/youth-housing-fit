// 입력창 공통 모양 (높이 52px, 글자 16px)
export const inputClass = (error) =>
  `h-[52px] w-full rounded-xl border bg-white px-4 text-base text-fit-ink transition-colors placeholder:text-[#8C7B6D] focus:outline-none focus:ring-2 ${
    error ? 'border-error focus:border-error focus:ring-error/20' : 'border-fit-border focus:border-fit-amber focus:ring-fit-amber/25'
  }`

// 선택 버튼(세그먼트·칩) 공통 모양
export const choiceClass = (selected, error) =>
  `flex min-h-[52px] cursor-pointer items-center justify-center rounded-xl px-3 text-center text-[16px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fit-amber ${
    selected
      ? 'border-[1.5px] border-fit-amber bg-fit-champagne font-bold text-fit-deep'
      : `border bg-white font-medium text-fit-ink hover:bg-fit-bg ${error ? 'border-error' : 'border-fit-line2'}`
  }`
