import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'

// ── 오른쪽 고정 패널에 보여줄 실제 화면 조각 ──
// 값은 docs/demo-guide.md·demo-response.json·data/housing.json 의 실제 예시.

const RESULT_ROWS = [
  { label: '나이', input: '만 26세', criterion: '19세 이상 39세 이하', verdict: 'met' },
  { label: '월평균소득', input: '250만원', criterion: '457만 6,036원 이하', verdict: 'met' },
  { label: '순자산', input: '5,000만원', criterion: '2억 5,100만원 이하', verdict: 'met' },
  { label: '청약통장', input: '미가입', criterion: '입주 전 가입 증명 필요', verdict: 'unknown' },
]

const INPUT_ROWS = [
  ['만 나이', '26세'],
  ['월 평균 소득', '250만원'],
  ['총 자산', '5,000만원'],
  ['혼인 상태', '미혼'],
  ['무주택 여부', '무주택'],
  ['청약통장', '가입'],
  ['희망 지역', '오산시 전체'],
]

const LISTING_ROWS = [
  ['주소', '경기도 오산시 가장산업동로 38'],
  ['보증금', '2,618만원'],
  ['참고 월 임대료', '12만 2,170원'],
  ['접수', '2026.05.04 ~ 05.08'],
]

const STEPS = [
  {
    panel: 'input',
    title: '조건 입력',
    body: '나이, 월 평균 소득, 총 자산, 혼인 상태, 무주택 여부, 청약통장, 희망 지역을 한 화면에서 입력해요.',
  },
  {
    panel: 'result',
    title: '자격 판정',
    body: '항목마다 충족인지 확인이 필요한지 보여주고, 비교한 기준값과 추가로 확인할 내용, 공고 원문 링크까지 함께 알려드려요.',
  },
  {
    panel: 'listing',
    title: '참고 주택',
    body: '조건에 맞는 공고를 모집 상태와 참고 임대료와 함께 모아 보여줘요. 임대료순으로 정렬할 수도 있어요.',
  },
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
    a: 'LH와 GH의 행복주택 모집공고 중 오산시 공고예요. 마감된 공고도 참고용으로 함께 보여줘요.',
  },
  {
    q: '입력한 정보는 저장되나요?',
    a: '판정에만 쓰고 따로 저장하지 않아요. 새로고침하면 처음부터 다시 입력해야 해요.',
  },
  {
    q: '로그인이 필요한가요?',
    a: '아니요. 가입이나 로그인 없이 바로 써볼 수 있어요.',
  },
]

// 배지·아이콘 없이 글자만으로 구분한다. 충족은 조용하게, 확인 필요는 밑줄로 눈에 띄게.
function Verdict({ verdict }) {
  if (verdict === 'met') {
    return <span className="text-base font-medium text-ok">충족</span>
  }
  return (
    <span className="border-b-2 border-accent pb-0.5 text-base font-bold text-accent-ink">
      확인 필요
    </span>
  )
}

function FragmentCard({ label, title, sub, children }) {
  return (
    <div
      className="w-full rounded-2xl bg-white p-7 ring-1 ring-stage-line/50 sm:p-9"
      role="img"
      aria-label={label}
    >
      <p className="text-[28px] font-semibold leading-[1.25] tracking-[-0.03em] text-accent-ink">
        {title}
      </p>
      {sub && <p className="mt-1 text-[15px] text-muted">{sub}</p>}
      <div aria-hidden="true">{children}</div>
    </div>
  )
}

function KeyValueRows({ rows }) {
  return (
    <dl className="mt-7 divide-y divide-line">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-6 py-3.5">
          <dt className="shrink-0 text-[15px] text-muted">{label}</dt>
          <dd className="text-right text-base font-semibold text-ink [font-feature-settings:'tnum']">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Fragment({ kind }) {
  if (kind === 'input') {
    return (
      <FragmentCard
        label="조건 입력 예시: 만 26세, 월 평균 소득 250만원, 총 자산 5,000만원, 미혼, 무주택, 청약통장 가입, 오산시 전체"
        title="조건 7가지를 입력해요"
      >
        <KeyValueRows rows={INPUT_ROWS} />
      </FragmentCard>
    )
  }

  if (kind === 'listing') {
    return (
      <FragmentCard
        label="참고 주택 예시: 오산가장 경기행복주택, 보증금 2,618만원, 참고 월 임대료 12만 2,170원, 접수 마감"
        title="오산가장 경기행복주택"
        sub="행복주택 · 전용 21.5㎡ · 접수 마감 · 참고용"
      >
        <KeyValueRows rows={LISTING_ROWS} />
      </FragmentCard>
    )
  }

  return (
    <FragmentCard
      label="판정 결과 예시: 나이, 월평균소득, 순자산은 충족, 청약통장은 확인 필요"
      title="기본조건을 충족했어요"
      sub="1개 항목은 입주 전 확인이 필요해요"
    >
      <dl className="mt-7 divide-y divide-line">
        {RESULT_ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4">
            <dt className="text-base font-semibold tracking-[-0.01em] text-ink">{row.label}</dt>
            <dd className="row-span-2 text-right">
              <Verdict verdict={row.verdict} />
            </dd>
            <dd className="text-[15px] text-muted [font-feature-settings:'tnum']">
              <span className="font-medium text-ink/80">{row.input}</span>
              <span className="block text-muted sm:inline">
                <span className="hidden sm:inline"> · </span>기준 {row.criterion}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </FragmentCard>
  )
}

// 모바일에서는 고정 패널이 없으므로 각 대목 아래에 같은 조각을 색 바탕과 함께 인라인으로 둔다
function InlineFragment({ kind }) {
  return (
    <div className="mt-8 rounded-xl bg-stage p-4 sm:p-6 lg:hidden">
      <Fragment kind={kind} />
    </div>
  )
}

const sectionTitle =
  'text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-[1.25] tracking-[-0.03em] text-accent-ink'

export default function MainPage() {
  const { state } = useLocation()
  const [panel, setPanel] = useState('result')

  // 화면 가운데 선에 걸린 대목을 따라 오른쪽 패널의 조각을 바꾼다
  useEffect(() => {
    const targets = document.querySelectorAll('[data-panel]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setPanel(e.target.dataset.panel)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // 결과·추천 화면의 "조건 수정"은 입력값을 들고 '/'로 돌아온다. 그 경우엔 메인을 건너뛰고 설문으로 보낸다.
  if (state?.condition) return <Navigate to="/condition" replace state={state} />

  return (
    <div className="min-h-screen bg-canvas selection:bg-accent/40">
      <header className="h-14 border-b border-line/80 bg-canvas">
        <div className="flex h-full items-center justify-between px-6 sm:px-8 lg:pl-[60px] lg:pr-6 xl:pl-[76px]">
          <Link to="/" className="rounded text-[17px] font-bold tracking-[-0.02em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink">
            청년주거 핏
          </Link>
          <Link
            to="/condition"
            className="inline-flex min-h-[44px] items-center rounded-full px-4 text-[15px] font-medium text-muted transition-colors hover:bg-accent-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
          >
            자격 진단
          </Link>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-3 lg:p-3">
        {/* 왼쪽: 스크롤되는 읽기 영역 */}
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
          <section
            aria-labelledby="hero-title"
            data-panel="result"
            className="py-12 sm:py-16 lg:py-[clamp(48px,12svh,112px)]"
          >
            <h1
              id="hero-title"
              className="enter-up text-[clamp(2.5rem,5.6vw,5rem)] font-semibold leading-[1.18] tracking-[-0.035em] text-accent-ink"
            >
              <span className="block">입력 한 번으로 보는</span>
              <span className="block">오산 청년임대 자격</span>
            </h1>
            <p
              className="enter-up mt-6 max-w-[44ch] text-base leading-[1.65] text-muted sm:text-[17px]"
              style={{ '--d': '40ms' }}
            >
              나이, 소득, 자산만 넣으면 항목마다 충족인지 확인이 필요한지 기준값과 함께
              알려드려요. 결과는 참고용이며 최종 자격은 공고문에서 확인하세요.
            </p>
            <div className="enter-up mt-8" style={{ '--d': '80ms' }}>
              <Link
                to="/condition"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium group text-accent-ink transition-[transform,background-color] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
              >
                자격 진단하기
                <ArrowIcon />
              </Link>
            </div>
            <InlineFragment kind="result" />
          </section>

          <section aria-labelledby="steps-title" className="pb-16 pt-8 sm:pb-24 lg:pb-32">
            <h2 id="steps-title" className={sectionTitle}>
              <span className="block">조건 입력부터</span>
              <span className="block">참고 주택까지 세 단계</span>
            </h2>
            <ol className="mt-12 flex flex-col gap-14 lg:gap-[22svh]">
              {STEPS.map((step) => (
                <li
                  key={step.panel}
                  data-panel={step.panel}
                  className="lg:py-[8svh]"
                >
                  <h3
                    className={`text-[28px] font-semibold tracking-[-0.03em] transition-colors duration-200 motion-reduce:transition-none ${
                      panel === step.panel ? 'text-accent-ink' : 'text-accent-ink lg:text-muted'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`mt-3 max-w-[42ch] text-base leading-[1.7] transition-colors duration-200 motion-reduce:transition-none sm:text-[17px] ${
                      panel === step.panel ? 'text-ink/85' : 'text-muted'
                    }`}
                  >
                    {step.body}
                  </p>
                  <InlineFragment kind={step.panel} />
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq-title" data-panel="result" className="pb-16 sm:pb-24 lg:pb-28">
            <h2 id="faq-title" className={sectionTitle}>
              자주 묻는 질문
            </h2>
            <div className="mt-8 flex max-w-[60ch] flex-col gap-5 text-base leading-[1.7] text-muted sm:text-[17px]">
              {FAQS.map((item) => (
                <p key={item.q}>
                  <strong className="font-semibold text-ink">{item.q}</strong> {item.a}
                </p>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="cta-title"
            className="mb-12 rounded-xl bg-accent-soft px-6 py-12 sm:px-10 sm:py-16 lg:mb-3"
          >
            <h2 id="cta-title" className={sectionTitle}>
              <span className="block">내 조건으로</span>
              <span className="block">바로 확인해 보세요</span>
            </h2>
            <p className="mt-4 max-w-[40ch] text-base leading-[1.65] text-muted sm:text-[17px]">
              가입이나 로그인 없이, 입력 한 번이면 돼요.
            </p>
            <Link
              to="/condition"
              className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium group text-accent-ink transition-[transform,background-color] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
            >
              자격 진단하기
              <ArrowIcon />
            </Link>
          </section>

          <footer className="flex flex-col gap-1 pb-10 pt-8 text-[13px] leading-[1.6] text-muted lg:pb-8">
            <p>데이터 출처: LH·GH 행복주택 모집공고 · 데이터 기준일 2026.10.15</p>
          </footer>
        </div>

        {/* 오른쪽: 스크롤해도 제자리에 있는 고정 패널. 헤더(56px) + 위아래 여백(12px×2) */}
        <aside
          aria-label="화면 예시"
          className="hidden items-center justify-center rounded-xl bg-stage px-10 lg:sticky lg:top-3 lg:flex lg:h-[calc(100svh-80px)]"
        >
          <div className="enter-fade grid w-full max-w-[500px] [&>*]:[grid-area:1/1]" style={{ '--d': '80ms' }}>
            {['input', 'result', 'listing'].map((kind) => (
              <div
                key={kind}
                aria-hidden={panel !== kind}
                className={`transition-opacity duration-200 motion-reduce:transition-none ${
                  panel === kind ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <Fragment kind={kind} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
