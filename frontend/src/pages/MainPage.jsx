import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import heroDusk from '../assets/hero-dusk.webp'
import Logo, { LogoMark } from '../components/Logo.jsx'
import { btnPill, focusRing, sectionLabel, serifTitle } from '../components/ui.js'

// 메인 화면. 디자인 확정안(톤 B, Mercury 구조): 히어로 → 기능 탭 → 진행 방식 → FAQ → CTA → 푸터
// 목업 안의 판정·추천 값은 docs/demo-response.json 과 data/housing.json 의 예시다. TOP 3 점수는 예시 데이터.

const NAV = [
  { href: '#features', label: '서비스 소개' },
  { href: '#steps', label: '진행 방식' },
  { href: '#faq', label: '자주 묻는 질문' },
]

const JUDGE_ROWS = [
  { label: '나이', input: '만 26세', criterion: '19~39세', ok: true },
  { label: '월평균소득', input: '250만원', criterion: '457만원 이하', ok: true },
  { label: '순자산', input: '5,000만원', criterion: '2억 5,100만원 이하', ok: true },
  { label: '청약통장', input: '미가입', criterion: '입주 전 가입 증명', ok: false },
]

const TABS = [
  {
    id: 'judge',
    label: '01 자격 판정',
    title: '항목마다 기준값과 함께 판정해요',
    body: '공고 원문의 기준과 내 입력을 나란히 보여줘요. 입력만으로 정할 수 없는 항목은 탈락이 아니라 확인 필요로 따로 알려줘요.',
  },
  {
    id: 'top3',
    label: '02 추천 주택 TOP 3',
    title: '희망 조건 점수로 공고를 골라요',
    body: '자격을 충족하고 접수 중인 공고만 후보로 두고, 내가 고른 우선순위로 점수를 매겨 TOP 3와 추천 이유를 보여줘요.',
  },
  {
    id: 'policy',
    label: '03 정책 추천',
    title: '선호하는 임대 방식에 맞춰 정책도',
    body: '공공임대 단지를 원하면 통합공공임대, 전셋집을 원하면 전세임대처럼 7개 정책 중 하나를 보여줘요.',
  },
  {
    id: 'listing',
    label: '04 참고용 공고',
    title: '조건에 맞는 공고도 함께 모아요',
    body: '지역과 월 임대료 상한에 맞는 공고를 함께 보여주고, 마감된 공고는 접수 마감 · 참고용으로 표시해요.',
  },
]

const STEPS = [
  { title: '조건 입력', items: ['나이, 혼인 상태, 무주택 여부', '월 평균 소득과 총 자산', '지역, 면적, 보증금, 마감 기한'] },
  { title: '자격 판정', items: ['항목별 충족·미충족·확인 필요', '비교한 기준값과 공고 원문 링크', '선호 임대 방식에 맞는 정책 추천'] },
  { title: '추천 주택', items: ['접수 중인 공고 중 TOP 3', '항목별 점수와 추천 이유', '지역·월 임대료에 맞는 참고용 공고'] },
]

const FAQS = [
  {
    q: '이 결과가 최종 자격인가요?',
    a: '아니요. 참고용이에요. 공고마다 우선순위와 증빙 기준이 달라서, 신청 전에 반드시 공고문에서 최종 확인하세요.',
  },
  {
    q: '확인 필요는 탈락이라는 뜻인가요?',
    a: '아니에요. 입력만으로 정할 수 없는 항목이에요. 예를 들어 청약통장은 지금 미가입이어도 그것만으로 탈락하지 않고, 입주 전에 가입 증명이 필요해요.',
  },
  {
    q: '어떤 공고를 기준으로 하나요?',
    a: '자격 판정은 GH 오산가장 행복주택 공고(2026.04.23) 기준이에요. 공고 목록은 LH·GH의 오산시 행복주택 공고이고, 마감된 공고도 참고용으로 함께 보여줘요.',
  },
  { q: '입력한 정보는 저장되나요?', a: '판정에만 쓰고 따로 저장하지 않아요. 새로고침하면 처음부터 다시 입력해야 해요.' },
  { q: '로그인이 필요한가요?', a: '아니요. 가입이나 로그인 없이 바로 써볼 수 있어요.' },
]

const h2Class = `${serifTitle} text-[clamp(1.875rem,3.4vw,3rem)] leading-[1.3]`

function Arrow({ down = false }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {down ? <path d="M12 5v14M6 13l6 6 6-6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  )
}

function Check() {
  return (
    <svg aria-hidden="true" className="mt-[3px] shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

// 노을 단지 이미지. 위아래·양옆이 바탕색으로 흐려지도록 마스크를 씌운다.
function DuskImage({ className = '', mask }) {
  return (
    <img
      src={heroDusk}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className}`}
      style={mask ? { WebkitMaskImage: mask, maskImage: mask } : undefined}
    />
  )
}

// ── 히어로 아래 판정 결과 화면 목업 ──
function HeroMock() {
  return (
    <div
      role="img"
      aria-label="판정 결과 화면 예시: 행복주택 청년계층 기본 조건 충족, 판정 항목 7개 중 충족 6개, 확인 필요 1개"
      className="relative mx-auto max-w-[1040px] overflow-hidden rounded-2xl bg-white text-left shadow-[0_40px_80px_-40px_rgba(70,45,30,0.45),0_0_0_1px_rgba(70,45,30,0.08)]"
    >
      <div aria-hidden="true">
        <div className="flex items-center justify-between border-b border-fit-line px-6 py-3.5">
          <span className="font-serif text-[15px] font-semibold">청년주거 핏</span>
          <span className="hidden gap-[18px] text-[13px] text-fit-muted sm:flex">
            <span className="font-semibold text-fit-ink">자격 판정</span>
            <span>추천 주택</span>
            <span>정책 추천</span>
          </span>
          <span className="h-2.5 w-[90px] rounded-full bg-fit-line" />
        </div>
        <div className="flex flex-wrap gap-7 px-6 pb-10 pt-7 sm:px-9">
          <div className="min-w-[240px] flex-1">
            <p className="text-[13px] text-fit-muted">행복주택 청년계층 · 참고용</p>
            <p className="mt-1.5 text-[28px] font-bold tracking-[-0.02em]">기본 조건 충족</p>
            <p className="mb-1.5 mt-4 text-[13px] text-fit-muted">판정 항목 7개 중</p>
            <div className="flex gap-1">
              <span className="h-1.5 flex-[6] rounded-full bg-fit-ok" />
              <span className="h-1.5 flex-1 rounded-full bg-fit-amber" />
            </div>
            <p className="mt-2 text-[13px] text-fit-muted">충족 6 · 확인 필요 1</p>
            <div className="mt-5 rounded-xl border border-fit-line2 px-[18px] py-4 text-[14px]">
              <div className="flex justify-between">
                <span className="font-semibold">추천 주택 TOP 3</span>
                <span className="text-fit-deep">예시</span>
              </div>
              <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-y-2 [font-feature-settings:'tnum']">
                <span className="text-fit-muted">1 · 예시 공고 A</span>
                <span>69.9점</span>
                <span className="text-fit-muted">2 · 예시 공고 B</span>
                <span>63.3점</span>
                <span className="text-fit-muted">3 · 예시 공고 C</span>
                <span>51.3점</span>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-[1.6] basis-[420px]">
            <p className="mb-1.5 text-[14px] font-semibold">주요 항목</p>
            <div className="grid grid-cols-[1.1fr_1fr_1.6fr_auto] gap-x-3.5 text-[14px] [font-feature-settings:'tnum']">
              {['항목', '내 입력', '기준', '판정'].map((head, index) => (
                <span key={head} className={`border-b border-fit-line py-2 text-[12px] text-fit-muted ${index === 3 ? 'text-right' : ''}`}>
                  {head}
                </span>
              ))}
              {JUDGE_ROWS.map((row) => [
                <span key={`${row.label}-l`} className="border-b border-fit-line py-3">{row.label}</span>,
                <span key={`${row.label}-i`} className="border-b border-fit-line py-3">{row.input}</span>,
                <span key={`${row.label}-c`} className="border-b border-fit-line py-3 text-fit-muted">{row.criterion}</span>,
                <span key={`${row.label}-v`} className={`border-b border-fit-line py-3 text-right font-semibold ${row.ok ? 'text-fit-ok' : 'text-fit-deep'}`}>
                  {row.ok ? '충족' : '확인 필요'}
                </span>,
              ])}
            </div>
            <p className="mt-3.5 text-[13px] text-fit-muted">기준: GH 오산가장 행복주택 공고 · 기준일 2026.04.23</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 기능 탭 안의 화면 조각 ──
function JudgePanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-bold">항목별 판정</span>
        <span className="rounded-full bg-fit-champagne px-2.5 py-1 text-[13px] font-semibold text-fit-deep">참고용</span>
      </div>
      <div className="mt-2.5">
        {JUDGE_ROWS.slice(0, 3).map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 border-b border-fit-line py-[11px]">
            <span className="text-[16px] font-semibold">{row.label}</span>
            <span className="row-span-2 self-center text-[16px] font-bold text-fit-ok">충족</span>
            <span className="text-[14px] text-fit-muted [font-feature-settings:'tnum']">
              {row.input} · 기준 {row.criterion}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 rounded-[10px] bg-fit-champagne px-3.5 py-[11px]">
        <span className="text-[16px] font-semibold">청약통장</span>
        <span className="row-span-2 self-center text-[16px] font-bold text-fit-deep">확인 필요</span>
        <span className="text-[14px] text-fit-muted">미가입 · 기준 입주 전 가입 증명</span>
      </div>
      <p className="mt-3 text-[15px] leading-[1.65] text-fit-muted">
        지금 미가입이어도 그것만으로 탈락하지 않아요. 입주 전에 가입 증명이 필요해요.
      </p>
    </>
  )
}

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-[14px]">
        <span className="text-fit-muted">{label}</span>
        <span className="font-semibold [font-feature-settings:'tnum']">{value}점</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-fit-line">
        <div className="h-1.5 rounded-full bg-fit-amber" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function Top3Panel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-bold">추천 주택 TOP 3</span>
        <span className="text-[13px] text-fit-muted">예시 점수</span>
      </div>
      <div className="mt-4 rounded-[14px] border border-fit-line2 px-5 py-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-fit-deep">1위 · 접수 중</p>
            <p className="mt-1 text-[18px] font-bold">예시 공고 A</p>
          </div>
          <p className="text-[32px] font-bold tracking-[-0.02em] [font-feature-settings:'tnum']">
            69.9<span className="text-[15px] font-medium text-fit-muted"> 점</span>
          </p>
        </div>
        <div className="mt-3.5 flex flex-col gap-2.5">
          <ScoreBar label="월 임대료 · 50%" value={80} />
          <ScoreBar label="보증금 · 30%" value={61} />
          <ScoreBar label="전용면적 · 20%" value={58} />
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-y-3 px-1 py-1.5 text-[15px] [font-feature-settings:'tnum']">
        <span>2 · 예시 공고 B</span>
        <span className="font-semibold">63.3점</span>
        <span>3 · 예시 공고 C</span>
        <span className="font-semibold">51.3점</span>
      </div>
    </>
  )
}

function PolicyPanel() {
  return (
    <>
      <p className="text-[18px] font-bold">선호 임대 방식</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className="flex min-h-[52px] items-center justify-center rounded-xl border-[1.5px] border-fit-amber bg-fit-champagne text-[16px] font-bold text-fit-deep">
          공공임대 단지
        </span>
        <span className="flex min-h-[52px] items-center justify-center rounded-xl border border-fit-line2 text-[16px]">직접 찾은 집에 전세</span>
      </div>
      <div className="mt-5 rounded-[14px] bg-fit-bg p-5">
        <p className="text-[13px] text-fit-muted">추천 정책</p>
        <p className="mt-1 font-serif text-[26px] font-medium">통합공공임대</p>
        <p className="mt-2.5 text-[15px] leading-[1.6] text-fit-muted">선호 임대 방식과 입력 조건으로 7개 정책 중 하나를 골라요.</p>
      </div>
      <p className="mt-3.5 text-[14px] text-fit-muted">결과는 참고용 · 실제 신청 자격은 모집공고에서 확인</p>
    </>
  )
}

function ListingPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-bold">참고용 공고</span>
        <span className="text-[13px] text-fit-muted">오산시 · 월 임대료 상한 기준</span>
      </div>
      <div className="mt-4 rounded-[14px] border border-fit-line2 px-[22px] py-5">
        <div className="flex justify-between gap-3">
          <p className="text-[13px] text-fit-muted">행복주택 · 전용 21.5㎡</p>
          <span className="rounded-full bg-fit-line px-2.5 py-0.5 text-[12px] font-semibold text-fit-muted">접수 마감 · 참고용</span>
        </div>
        <p className="mt-1.5 text-[20px] font-bold">오산가장 경기행복주택</p>
        <p className="mt-1 text-[14px] text-fit-muted">경기도 오산시 가장산업동로 38</p>
        <dl className="mt-4 grid grid-cols-3 gap-3 [font-feature-settings:'tnum']">
          {[
            ['보증금', '2,618만원'],
            ['월 임대료', '12만 2,170원'],
            ['접수', '05.04 ~ 05.08'],
          ].map(([term, value]) => (
            <div key={term} className="rounded-[10px] bg-fit-bg px-3.5 py-3">
              <dt className="text-[12px] text-fit-muted">{term}</dt>
              <dd className="mt-1 text-[16px] font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-3.5 text-[14px] leading-[1.6] text-fit-muted">
        TOP 3는 접수 중인 공고만 고르고, 참고용 목록은 마감 공고도 함께 보여줘요.
      </p>
    </>
  )
}

const PANELS = { judge: JudgePanel, top3: Top3Panel, policy: PolicyPanel, listing: ListingPanel }

function FeatureTabs() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])

  // 방향키·Home·End 로 탭 이동 (WAI-ARIA 탭 패턴)
  const onKeyDown = (event) => {
    const last = TABS.length - 1
    const next = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: last }[event.key]
    if (next === undefined) return
    event.preventDefault()
    const index = (next + TABS.length) % TABS.length
    setActive(index)
    tabRefs.current[index]?.focus()
  }

  const Panel = PANELS[TABS[active].id]

  return (
    <div className="mt-16 flex flex-wrap items-center gap-14">
      <div className="min-w-0 flex-[1_1_340px]">
        <div role="tablist" aria-label="서비스 기능" aria-orientation="vertical" onKeyDown={onKeyDown} className="flex flex-col gap-[22px]">
          {TABS.map((tab, index) => {
            const selected = index === active
            return (
              <div key={tab.id} role="presentation" className={`border-t-2 ${selected ? 'border-fit-amber' : 'border-fit-line2'}`}>
                <button
                  ref={(el) => (tabRefs.current[index] = el)}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls="feature-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className={`block min-h-[44px] w-full pt-[18px] text-left ${focusRing}`}
                >
                  <span className={`block text-[14px] font-semibold ${selected ? 'text-fit-amber' : 'text-fit-muted'}`}>{tab.label}</span>
                  <span className={`mt-1.5 block font-serif text-[24px] leading-[1.4] tracking-[-0.02em] ${selected ? 'text-fit-ink' : 'text-fit-muted'}`}>
                    {tab.title}
                  </span>
                </button>
                {selected && <p className="mt-2.5 max-w-[38ch] text-[16px] leading-[1.7] text-fit-muted">{tab.body}</p>}
              </div>
            )
          })}
        </div>
        <Link to="/condition" className={`mt-8 ${btnPill}`}>
          자격 진단 시작하기 <Arrow />
        </Link>
      </div>

      <div className="relative min-w-0 flex-[1.35_1_540px] overflow-hidden rounded-[20px] px-6 pt-14 sm:px-14">
        <DuskImage />
        <div
          id="feature-panel"
          role="tabpanel"
          aria-labelledby={`tab-${TABS[active].id}`}
          className="relative -mb-6 min-h-[492px] rounded-t-2xl bg-white px-[30px] pb-12 pt-7 shadow-[0_30px_60px_-30px_rgba(70,45,30,0.45),0_0_0_1px_rgba(70,45,30,0.06)]"
        >
          <Panel />
        </div>
      </div>
    </div>
  )
}

export default function MainPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [age, setAge] = useState('')

  // 예전 경로: 입력값을 들고 '/'로 돌아오면 조건 입력으로 보낸다
  if (state?.condition) return <Navigate to="/condition" replace state={state} />

  // 히어로에서 입력한 나이를 조건 입력 1단계로 넘긴다 (비워도 넘어갈 수 있다)
  const start = (event) => {
    event.preventDefault()
    navigate('/condition', { state: age.trim() ? { prefill: { age: age.trim() } } : undefined })
  }

  return (
    <div className="min-h-screen overflow-hidden bg-fit-bg text-fit-ink">
      <header className="mx-auto flex min-h-[68px] max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6">
        <Link to="/" className={`inline-flex min-h-[44px] items-center rounded ${focusRing}`}>
          <Logo />
        </Link>
        <nav aria-label="메인 메뉴" className="hidden flex-wrap gap-1 text-[15px] md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={`inline-flex min-h-[44px] items-center rounded px-3 hover:text-fit-deep ${focusRing}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          to="/condition"
          className={`inline-flex min-h-[44px] items-center rounded-full border border-fit-border bg-white px-5 text-[15px] font-semibold hover:bg-fit-champagne ${focusRing}`}
        >
          자격 진단
        </Link>
      </header>

      <section aria-labelledby="hero-title" className="pt-20 text-center">
        <div className="px-6">
          <h1 id="hero-title" className={`${serifTitle} text-[clamp(2.5rem,4.8vw,4.25rem)] leading-[1.2] tracking-[-0.035em]`}>
            <span className="block">입력 한 번으로 보는</span>
            <span className="block">오산 청년임대 자격</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-[18px] leading-[1.6] text-fit-muted">
            항목별 자격 판정부터 정책 추천, 공고 TOP 3까지 이어서 보여줘요. 가입 없이 바로 써요.
          </p>
          <form onSubmit={start} className="mt-9 flex flex-wrap justify-center gap-2">
            <label htmlFor="hero-age" className="sr-only">
              만 나이
            </label>
            <input
              id="hero-age"
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="만 나이를 입력하세요"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="min-h-[50px] w-[250px] rounded-full border border-fit-border bg-white px-[22px] text-base text-fit-ink placeholder:text-[#8C7B6D] focus:border-fit-amber focus:outline-none focus:ring-2 focus:ring-fit-amber/30"
            />
            <button
              type="submit"
              className={`inline-flex min-h-[50px] items-center rounded-full bg-fit-amber px-6 text-base font-semibold text-white transition-colors hover:bg-fit-deep ${focusRing}`}
            >
              자격 진단 시작
            </button>
            <a href="#steps" className={`inline-flex min-h-[50px] items-center rounded-full border border-fit-border bg-white px-[22px] text-base hover:bg-fit-champagne ${focusRing}`}>
              진행 방식 보기
            </a>
          </form>
        </div>

        <div className="relative mt-16 px-6">
          <div className="absolute inset-x-0 bottom-0 top-10 overflow-hidden" aria-hidden="true">
            <DuskImage mask="linear-gradient(to bottom,transparent 0%,#000 30%,#000 70%,transparent 100%)" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right,#F7F2EA 0%,rgba(247,242,234,0) 14%,rgba(247,242,234,0) 86%,#F7F2EA 100%)',
              }}
            />
          </div>
          <HeroMock />
          <div aria-hidden="true" className="relative -mx-6 -mt-[160px] h-[160px] bg-gradient-to-b from-fit-bg/0 to-fit-bg" />
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className="mx-auto max-w-[1200px] px-6 pb-[104px] pt-24">
        <div className="text-center">
          <p className={sectionLabel}>서비스 소개</p>
          <h2 id="features-title" className={`${h2Class} mt-3.5`}>
            조건 하나로, 판정부터 추천까지
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[17px] leading-[1.7] text-fit-muted">
            정보를 모아 보여주는 데서 끝나지 않고, 내 조건으로 항목마다 판정하고 공고를 골라드려요.
          </p>
        </div>
        <FeatureTabs />
      </section>

      <section id="steps" aria-labelledby="steps-title" className="px-6 pb-28 pt-6">
        <div className="mx-auto max-w-[1200px] text-center">
          <p className="text-[17px] text-fit-muted">공고문을 처음부터 다 읽지 않아도 돼요.</p>
          <h2 id="steps-title" className={`${h2Class} mt-3.5`}>
            <span className="block">조건 입력부터 추천 주택까지,</span>
            <span className="block">세 단계면 끝나요.</span>
          </h2>
          <Link to="/condition" className={`mt-[18px] inline-flex min-h-[44px] items-center gap-1.5 text-[17px] hover:text-fit-deep ${focusRing}`}>
            자격 진단 시작하기 <Arrow />
          </Link>
          <ol className="mt-14 grid gap-10 text-left md:grid-cols-3">
            {STEPS.map((step, index) => {
              const last = index === STEPS.length - 1
              return (
                <li key={step.title}>
                  <div className="text-center">
                    <span
                      className={`inline-flex min-h-[40px] items-center rounded-lg px-[18px] text-[16px] ${
                        last ? 'bg-fit-champagne font-semibold text-fit-deep' : 'border border-fit-border'
                      }`}
                    >
                      {index + 1}단계
                    </span>
                  </div>
                  <div aria-hidden="true" className="relative hidden h-10 md:block">
                    <span
                      className={`absolute top-[19px] h-px bg-fit-border ${index === 0 ? 'left-1/2' : '-left-10'} ${last ? 'right-1/2' : '-right-10'}`}
                    />
                    <span
                      className={`absolute left-1/2 top-[13px] -ml-1.5 size-3 rounded-full ${last ? 'bg-fit-amber' : 'border border-fit-border bg-fit-bg'}`}
                    />
                  </div>
                  <div
                    className={`mt-2 rounded-[14px] border border-fit-line2 bg-white p-7 ${last ? 'shadow-[0_18px_36px_-22px_rgba(70,45,30,0.35)]' : ''}`}
                  >
                    <h3 className="text-[19px] font-semibold">{step.title}</h3>
                    <ul className="mt-[18px] flex flex-col gap-2.5 text-[16px] leading-[1.5] text-fit-muted">
                      {step.items.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span className="text-fit-ink">
                            <Check />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="border-t border-fit-line2 px-6 py-28">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-14">
          <div className="flex-[1_1_360px]">
            <h2 id="faq-title" className={`${serifTitle} text-[clamp(2.25rem,4.2vw,3.625rem)] leading-[1.25] tracking-[-0.035em]`}>
              <span className="block">자주 묻는</span>
              <span className="block">질문</span>
            </h2>
            <p className="mt-6 max-w-[30ch] text-[17px] leading-[1.7] text-fit-muted">
              찾는 답이 없다면 판정 결과의 공고 원문 링크에서 확인할 수 있어요.
            </p>
          </div>
          <div className="min-w-0 flex-[1.4_1_480px]">
            {FAQS.map((item, index) => (
              <details key={item.q} open={index === 0} className="group border-b border-fit-line2">
                <summary className={`flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-4 text-[19px] font-medium [&::-webkit-details-marker]:hidden ${focusRing}`}>
                  {item.q}
                  <svg aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="mb-7 max-w-[56ch] text-[16px] leading-[1.75] text-fit-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="relative overflow-hidden px-6 pb-[136px] pt-[120px] text-center">
        <DuskImage mask="linear-gradient(to bottom,transparent 0%,#000 45%,#000 100%)" />
        <div className="relative">
          <h2 id="cta-title" className={`${serifTitle} text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.3]`}>
            <span className="block">내 조건으로</span>
            <span className="block">바로 확인해 보세요</span>
          </h2>
          <p className="mt-4 text-[18px]">가입이나 로그인 없이, 입력 한 번이면 돼요.</p>
          <Link
            to="/condition"
            className={`mt-8 inline-flex min-h-[54px] items-center gap-2 rounded-full bg-fit-amber px-[30px] text-[17px] font-semibold text-white transition-colors hover:bg-fit-deep ${focusRing}`}
          >
            자격 진단하기 <Arrow />
          </Link>
        </div>
      </section>

      <footer className="bg-fit-ink px-6 pb-10 pt-[72px] text-[#E8DDCB]">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap justify-between gap-12">
            <div className="flex-[1_1_260px]">
              <p className="flex items-center gap-2 font-serif text-[22px] font-semibold text-fit-bg">
                <LogoMark size={22} base="#F7F2EA" />
                청년주거 핏
              </p>
              <p className="mt-3.5 max-w-[30ch] text-[15px] leading-[1.65] text-[#BCAE9F]">
                조건을 한 번 입력하면 자격 판정부터 공고 추천까지 이어서 보여주는 청년 주거 서비스
              </p>
            </div>
            <nav aria-label="서비스" className="flex-[0_1_160px]">
              <p className="text-[13px] text-[#BCAE9F]">서비스</p>
              <ul className="mt-3.5 flex flex-col gap-0.5 text-[15px]">
                <li>
                  <Link to="/condition" className={`inline-flex min-h-[36px] items-center text-fit-bg hover:underline ${focusRing}`}>
                    자격 진단
                  </Link>
                </li>
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={`inline-flex min-h-[36px] items-center text-fit-bg hover:underline ${focusRing}`}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex-[0_1_220px]">
              <p className="text-[13px] text-[#BCAE9F]">데이터</p>
              <ul className="mt-3.5 flex flex-col gap-3 text-[15px] text-fit-bg">
                <li>LH 행복주택 모집공고</li>
                <li>GH 행복주택 모집공고</li>
                <li>데이터 기준일 2026.10.15</li>
              </ul>
            </div>
            <div className="flex-[0_1_220px]">
              <p className="text-[13px] text-[#BCAE9F]">만든 사람들</p>
              <ul className="mt-3.5 flex flex-col gap-0.5 text-[15px] text-fit-bg">
                <li className="flex min-h-[36px] items-center">한신대학교 캡스톤디자인</li>
                <li className="flex min-h-[36px] items-center">팀 온기</li>
                <li>
                  <a
                    href="https://github.com/kimeunjae-11/youth-housing-fit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex min-h-[36px] items-center text-fit-bg hover:underline ${focusRing}`}
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-14 border-t border-[#4A3A30] pt-6 text-[13px] leading-[1.7] text-[#BCAE9F]">
            판정 결과는 입력값을 바탕으로 한 참고용이며, 최종 자격과 우선순위는 각 모집공고와 사업 주체의 심사에 따릅니다.
            입력한 정보는 판정에만 쓰고 저장하지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
