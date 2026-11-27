// 톤 B 공통 클래스. 화면마다 앰버로 채운 버튼(btnPrimary)은 하나만 쓴다.

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fit-amber'

export const btnPrimary = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-fit-amber px-6 text-base font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-fit-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-fit-amber disabled:active:scale-100 ${focusRing}`

export const btnSecondary = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-fit-border bg-white px-5 text-[15px] font-medium text-fit-ink transition-[transform,background-color] duration-150 ease-out hover:bg-fit-bg active:scale-[0.98] ${focusRing}`

export const btnPill = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-fit-border bg-white px-4 text-[15px] text-fit-ink transition-colors hover:bg-fit-bg ${focusRing}`

export const linkDeep = `inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-fit-deep underline-offset-4 hover:underline ${focusRing}`

export const card = 'rounded-[18px] border border-fit-line2 bg-white'

export const sectionLabel = 'text-[14px] font-semibold text-fit-deep'

export const serifTitle = 'font-serif font-normal tracking-[-0.03em] text-fit-ink'

export { focusRing }
