import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { checkHealth } from '../api/health.js'
import DateField from '../components/form/DateField.jsx'
import { FieldMessage, OptionalMark, labelClass } from '../components/form/FieldShell.jsx'
import { choiceClass } from '../components/form/fieldStyles.js'
import NumberField from '../components/form/NumberField.jsx'
import SegmentedField from '../components/form/SegmentedField.jsx'
import SelectField from '../components/form/SelectField.jsx'
import { btnPrimary, btnSecondary, card, focusRing, serifTitle } from '../components/ui.js'
import { formatDate } from '../utils/format.js'
import {
  ACTIVITY_OPTIONS,
  AGE_RANGE,
  CONDITION_STEPS,
  EXAMPLE_VALUES,
  FIELD_ORDER,
  HOMELESS_OPTIONS,
  INITIAL_VALUES,
  MARITAL_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_SLOTS,
  REGION_OPTIONS,
  RENTAL_PREFERENCE_OPTIONS,
  SUBSCRIPTION_OPTIONS,
  toFormValues,
  toPayload,
  validateCondition,
  validateStep,
} from '../constants/condition.js'

// 단계별 화면 제목 (CONDITION_STEPS 순서와 같다)
const STEP_HEADINGS = ['기본 정보를 알려주세요', '소득과 자산을 입력해 주세요', '어떤 집을 찾고 있나요?']
const STEP_SUMMARY = ['나이 · 혼인 · 무주택 · 청약통장', '월 소득 · 총 자산 · 자동차', '지역 · 임대 방식 · 우선순위']

// 오른쪽 '입력한 조건' 미리 비교에 쓰는 기준값 (만원 단위).
// GH 오산가장 행복주택 청년 공고(2026.04.23) 기준이다. 판정 기준을 내려주는 API가 생기면 그 값으로 바꾼다.
const PREVIEW_CRITERIA = { income: 457.6036, assets: 25100, car: 4542 }
const PREVIEW_SOURCE = 'GH 오산가장 행복주택 공고 (2026.04.23)'

const STATUS = {
  in: { label: '기준 안', text: 'text-fit-ok', dot: 'bg-fit-ok' },
  out: { label: '기준 밖', text: 'text-fit-deep', dot: 'bg-fit-deep' },
  review: { label: '확인 필요', text: 'text-fit-deep', dot: 'bg-fit-amber' },
  none: { label: '미입력', text: 'text-fit-muted', dot: 'bg-fit-border' },
}

const toNumber = (value) => {
  if (value === '' || value == null) return null
  const number = Number(String(value).replaceAll(',', ''))
  return Number.isNaN(number) ? null : number
}

// 만원 단위 숫자 → '2억 5,100만원'
function formatMan(value) {
  if (value == null) return ''
  if (value >= 10000) {
    const eok = Math.floor(value / 10000)
    const rest = value % 10000
    return `${eok}억${rest ? ` ${rest.toLocaleString('ko-KR')}만원` : ''}`
  }
  return `${value.toLocaleString('ko-KR')}만원`
}

const withinMax = (value, max) => (value == null ? 'none' : value <= max ? 'in' : 'out')

function buildSummary(values) {
  const age = toNumber(values.age)
  const income = toNumber(values.income)
  const assets = toNumber(values.assets)
  const car = toNumber(values.car_value)
  const optionLabel = (options, value) => options.find((option) => option.value === value)?.label ?? ''

  return [
    { label: '만 나이', value: age == null ? '' : `만 ${age}세`, status: age == null ? 'none' : age >= AGE_RANGE.min && age <= AGE_RANGE.max ? 'in' : 'out' },
    {
      label: '혼인 상태',
      value: optionLabel(MARITAL_OPTIONS, values.marital_status),
      status: !values.marital_status ? 'none' : values.marital_status === 'single' ? 'in' : 'out',
    },
    {
      label: '무주택 여부',
      value: values.homeless_status === 'homeless' ? '무주택' : values.homeless_status ? '주택 보유' : '',
      status: !values.homeless_status ? 'none' : values.homeless_status === 'homeless' ? 'in' : 'out',
    },
    {
      label: '청약통장',
      value: values.subscription_account === 'active' ? '가입' : values.subscription_account ? '미가입' : '',
      // 미가입만으로 탈락하지 않는다 (입주 전 가입 증명)
      status: !values.subscription_account ? 'none' : values.subscription_account === 'active' ? 'in' : 'review',
    },
    { label: '월 평균 소득', value: formatMan(income), status: withinMax(income, PREVIEW_CRITERIA.income) },
    { label: '총 자산', value: formatMan(assets), status: withinMax(assets, PREVIEW_CRITERIA.assets) },
    { label: '자동차 가액', value: formatMan(car), status: withinMax(car, PREVIEW_CRITERIA.car) },
  ]
}

function StepRail({ step, onPick }) {
  return (
    <nav aria-label="입력 단계" className="hidden lg:block lg:w-[220px] lg:shrink-0">
      <ol className="flex flex-col">
        {CONDITION_STEPS.map((item, index) => {
          const done = index < step
          const active = index === step
          return (
            <li key={item.key} className="pb-7">
              <button
                type="button"
                onClick={() => onPick(index)}
                disabled={index > step}
                aria-current={active ? 'step' : undefined}
                className={`flex min-h-[44px] w-full items-start gap-3.5 rounded text-left disabled:cursor-default ${focusRing}`}
              >
                <span
                  className={`flex size-[30px] shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                    done ? 'bg-fit-ink text-white' : active ? 'bg-fit-amber text-white' : 'border border-fit-border text-fit-muted'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </span>
                <span>
                  <span className={`block text-[16px] ${active ? 'font-bold' : 'font-medium'} ${index > step ? 'text-fit-muted' : 'text-fit-ink'}`}>
                    {item.title}
                    {done && <span className="sr-only"> (완료, 눌러서 돌아가기)</span>}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[1.5] text-fit-muted">{STEP_SUMMARY[index]}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function SummaryPanel({ values, health }) {
  const rows = buildSummary(values)
  return (
    <aside aria-labelledby="summary-title" className="flex w-full flex-col gap-3.5 lg:w-[320px] lg:shrink-0">
      <section className={`${card} p-6`}>
        <h2 id="summary-title" className="text-[17px] font-bold">
          입력한 조건
        </h2>
        <p className="mt-1 text-[13px] leading-[1.5] text-fit-muted">공고 기준과 미리 비교해 봤어요 · 참고용</p>
        <dl className="mt-3.5">
          {rows.map((row) => {
            const status = STATUS[row.status]
            return (
              <div key={row.label} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-t border-fit-line py-[11px]">
                <dt className="text-[14px] text-fit-muted">{row.label}</dt>
                <dd className={`row-span-2 inline-flex items-center gap-1.5 self-center text-[13px] font-semibold ${status.text}`}>
                  <span aria-hidden="true" className={`size-[7px] rounded-full ${status.dot}`} />
                  {status.label}
                </dd>
                <dd className="text-[15px] font-semibold [font-feature-settings:'tnum']">{row.value || '—'}</dd>
              </div>
            )
          })}
        </dl>
      </section>
      <p className="px-1 text-[13px] leading-[1.6] text-fit-muted">
        비교 기준: {PREVIEW_SOURCE}. 최종 판정은 다음 화면에서 공고 규칙까지 함께 확인해요.
        {health.status === 'ok' && ` 공고 데이터 기준일 ${formatDate(health.dataAsOf)}.`}
      </p>
      {health.status === 'down' && (
        <p role="alert" className="rounded-xl bg-error-container px-4 py-3 text-[14px] font-medium text-on-error-container">
          판정 서버에 연결하지 못했어요. 백엔드 서버가 켜져 있는지 확인해 주세요.
        </p>
      )}
    </aside>
  )
}

// 우선순위 칩: 누른 순서대로 1·2·3순위가 되고, 다시 누르면 빠지며 뒤 순위가 한 칸씩 당겨진다
function PriorityChips({ values, errors, onSet }) {
  const chosen = PRIORITY_SLOTS.map((slot) => values[slot]).filter(Boolean)
  const error = PRIORITY_SLOTS.map((slot) => errors[slot]).find(Boolean)

  const toggle = (key) => {
    const next = chosen.includes(key) ? chosen.filter((item) => item !== key) : chosen.length < PRIORITY_SLOTS.length ? [...chosen, key] : chosen
    onSet(Object.fromEntries(PRIORITY_SLOTS.map((slot, index) => [slot, next[index] ?? ''])))
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className={`${labelClass} mb-1 p-0`}>
        무엇을 먼저 볼까요?
        <OptionalMark />
      </legend>
      <p id="priority-hint" className="mb-1.5 text-[13px] text-fit-muted">
        먼저 볼 조건을 순서대로 눌러 주세요. 최대 3개, 다시 누르면 빠져요.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PRIORITY_OPTIONS.filter((option) => option.value).map((option, index) => {
          const rank = chosen.indexOf(option.value)
          const selected = rank >= 0
          return (
            <button
              key={option.value}
              id={index === 0 ? PRIORITY_SLOTS[0] : undefined}
              type="button"
              aria-pressed={selected}
              aria-describedby="priority-hint"
              onClick={() => toggle(option.value)}
              className={`${choiceClass(selected, Boolean(error))} justify-start gap-2.5 text-left ${focusRing}`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                  selected ? 'bg-fit-amber text-white' : 'border border-fit-border'
                }`}
              >
                {selected ? rank + 1 : ''}
                {selected && <span className="sr-only">순위</span>}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>
      <FieldMessage id="priority-message" error={error} />
    </fieldset>
  )
}

export default function ConditionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 결과 화면의 '조건 수정'으로 돌아오면 직전 입력값을, 메인에서 나이를 입력하고 왔으면 나이를 채워 둔다
  const prefillAge = location.state?.prefill?.age ?? ''
  const [values, setValues] = useState(() => {
    if (location.state?.condition) return toFormValues(location.state.condition)
    return prefillAge ? { ...INITIAL_VALUES, age: String(prefillAge) } : INITIAL_VALUES
  })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(0)
  const stepConfig = CONDITION_STEPS[step]
  const isLast = step === CONDITION_STEPS.length - 1
  const headingRef = useRef(null)
  // 단계가 바뀐 뒤 포커스를 옮길 필드 id (없으면 단계 제목으로)
  const pendingFocus = useRef(null)
  const [health, setHealth] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    checkHealth()
      .then((data) => !cancelled && setHealth({ status: 'ok', dataAsOf: data.dataAsOf }))
      .catch(() => !cancelled && setHealth({ status: 'down' }))
    return () => {
      cancelled = true
    }
  }, [])

  const fillExample = () => {
    setValues(EXAMPLE_VALUES)
    setErrors({})
  }

  const clearErrors = (names) =>
    setErrors((prev) => {
      if (!names.some((name) => prev[name])) return prev
      return Object.fromEntries(Object.entries(prev).filter(([name]) => !names.includes(name)))
    })

  // 값이 바뀌면 그 필드의 에러만 걷어낸다
  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    clearErrors([name])
  }

  const setPriorities = (next) => {
    setValues((prev) => ({ ...prev, ...next }))
    clearErrors(PRIORITY_SLOTS)
  }

  // 단계가 바뀌면 키보드·스크린리더 사용자가 새 화면을 알 수 있게 포커스를 옮긴다
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const target = pendingFocus.current && document.getElementById(pendingFocus.current)
    pendingFocus.current = null
    ;(target ?? headingRef.current)?.focus()
  }, [step])

  const goTo = (index) => {
    if (index > step) return
    setErrors({})
    setStep(index)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    // 마지막이 아니면 이 단계만 검증하고 다음 단계로
    if (!isLast) {
      const stepErrors = validateStep(values, step)
      setErrors(stepErrors)
      const firstInvalid = stepConfig.fields.find((name) => stepErrors[name])
      if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus()
        return
      }
      setStep(step + 1)
      return
    }

    // 마지막 단계: 전체를 다시 검증한다. 앞 단계에 에러가 있으면 그 단계로 돌아간다
    const nextErrors = validateCondition(values)
    setErrors(nextErrors)

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name])
    if (firstInvalid) {
      const target = CONDITION_STEPS.findIndex((item) => item.fields.includes(firstInvalid))
      if (target === step) {
        document.getElementById(firstInvalid)?.focus()
      } else {
        pendingFocus.current = firstInvalid
        setStep(target)
      }
      return
    }

    navigate('/result', { state: { condition: toPayload(values) } })
  }

  const hasErrors = Object.keys(errors).length > 0
  const showPrefillNote = prefillAge && values.age === String(prefillAge) && !errors.age

  return (
    <>
      <div aria-hidden="true" className="h-[3px] bg-fit-line">
        <div className="h-[3px] bg-fit-amber transition-[width] duration-300 ease-out" style={{ width: `${((step + 1) / CONDITION_STEPS.length) * 100}%` }} />
      </div>

      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10 px-6 pb-24 pt-14 lg:flex-row lg:items-start lg:gap-12">
        <StepRail step={step} onPick={goTo} />

        <form noValidate onSubmit={handleSubmit} className="w-full min-w-0 max-w-[600px] flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-[14px] text-fit-muted">
              <span className="font-semibold text-fit-ink">{step + 1}</span> / {CONDITION_STEPS.length} · {stepConfig.title}
            </p>
            <button
              type="button"
              onClick={fillExample}
              className={`inline-flex min-h-[44px] items-center rounded-full border border-dashed border-fit-border px-4 text-[14px] text-fit-deep hover:bg-white ${focusRing}`}
            >
              예시로 체험하기
            </button>
          </div>
          <h1 ref={headingRef} tabIndex={-1} className={`${serifTitle} mt-2 text-[clamp(1.875rem,3vw,2.5rem)] leading-[1.3] focus:outline-none`}>
            {STEP_HEADINGS[step]}
          </h1>
          <p className="mt-3 text-[16px] leading-[1.6] text-fit-muted">{stepConfig.description}</p>

          {hasErrors && (
            <p role="alert" className="mt-6 rounded-xl bg-error-container px-4 py-3 text-[14px] font-medium text-on-error-container">
              입력하지 않았거나 확인이 필요한 항목이 있어요.
            </p>
          )}

          <div className="mt-9 flex flex-col gap-[26px]">
            {step === 0 && (
              <>
                <NumberField
                  name="age"
                  label="만 나이"
                  unit="세"
                  placeholder="예: 26"
                  required
                  value={values.age}
                  error={errors.age}
                  onChange={handleChange}
                  note={
                    showPrefillNote && (
                      <p className="flex items-center gap-1.5 text-[13px] text-fit-ok">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                        메인 화면에서 입력한 나이를 가져왔어요
                      </p>
                    )
                  }
                />
                <SegmentedField name="marital_status" label="혼인 상태" options={MARITAL_OPTIONS} required value={values.marital_status} error={errors.marital_status} onChange={handleChange} />
                <SegmentedField name="homeless_status" label="무주택 여부" options={HOMELESS_OPTIONS} required value={values.homeless_status} error={errors.homeless_status} onChange={handleChange} />
                <SegmentedField
                  name="subscription_account"
                  label="청약통장 가입 여부"
                  options={SUBSCRIPTION_OPTIONS}
                  required
                  value={values.subscription_account}
                  error={errors.subscription_account}
                  onChange={handleChange}
                />
                <SegmentedField
                  name="student_status"
                  label="학생·구직 상태"
                  options={ACTIVITY_OPTIONS}
                  optional
                  hint="정책 추천의 대학생·취업준비생 요건에 써요."
                  value={values.student_status}
                  error={errors.student_status}
                  onChange={handleChange}
                />
              </>
            )}

            {step === 1 && (
              <>
                <NumberField
                  name="income"
                  label="월 평균 소득"
                  unit="만원"
                  placeholder="예: 250"
                  hint="세전, 건강보험료 산정 기준 (본인 1인 가구 기준)"
                  required
                  value={values.income}
                  error={errors.income}
                  onChange={handleChange}
                />
                <NumberField name="assets" label="총 자산" unit="만원" placeholder="예: 5000" required value={values.assets} error={errors.assets} onChange={handleChange} />
                <NumberField
                  name="car_value"
                  label="자동차 가액"
                  optional
                  unit="만원"
                  placeholder="예: 0"
                  hint="차량이 없으면 0을 입력해 주세요."
                  value={values.car_value}
                  error={errors.car_value}
                  onChange={handleChange}
                />
              </>
            )}

            {step === 2 && (
              <>
                <SelectField name="region" label="희망 지역" options={REGION_OPTIONS} required value={values.region} error={errors.region} onChange={handleChange} />
                <SegmentedField
                  name="rental_preference"
                  label="선호 임대 방식"
                  options={RENTAL_PREFERENCE_OPTIONS}
                  optional
                  stacked
                  value={values.rental_preference}
                  error={errors.rental_preference}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 gap-x-3.5 gap-y-[26px] sm:grid-cols-2">
                  <NumberField
                    name="max_rent"
                    label="월 임대료 상한"
                    optional
                    unit="만원"
                    placeholder="예: 30"
                    hint="추천 주택에만 쓰고 자격 판정에는 쓰지 않아요."
                    value={values.max_rent}
                    error={errors.max_rent}
                    onChange={handleChange}
                  />
                  <NumberField name="max_deposit" label="보증금 상한" optional unit="만원" placeholder="예: 3000" value={values.max_deposit} error={errors.max_deposit} onChange={handleChange} />
                  <NumberField name="desired_area" label="희망 전용면적" optional unit="평" placeholder="예: 10" value={values.desired_area} error={errors.desired_area} onChange={handleChange} />
                  <DateField name="deadline_pref" label="접수 마감 기한" optional value={values.deadline_pref} error={errors.deadline_pref} onChange={handleChange} />
                </div>
                <PriorityChips values={values} errors={errors} onSet={setPriorities} />
              </>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <div className="flex gap-2">
              {step > 0 && (
                <button type="button" onClick={() => goTo(step - 1)} className={`${btnSecondary} min-h-[56px]`}>
                  이전
                </button>
              )}
              <button type="submit" className={`${btnPrimary} min-h-[56px] flex-1 text-[17px]`}>
                {isLast ? '자격 판정 보기' : '다음'}
              </button>
            </div>
            <p className="text-center text-[13px] text-fit-muted">입력한 정보는 판정에만 쓰고 저장하지 않아요.</p>
          </div>
        </form>

        <SummaryPanel values={values} health={health} />
      </div>
    </>
  )
}
