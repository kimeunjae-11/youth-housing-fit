import { useEffect, useState } from 'react'
import { checkHealth } from '../api/health.js'
import { useLocation, useNavigate } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import DateField from '../components/form/DateField.jsx'
import NumberField from '../components/form/NumberField.jsx'
import SegmentedField from '../components/form/SegmentedField.jsx'
import SelectField from '../components/form/SelectField.jsx'
import StepTracker from '../components/StepTracker.jsx'
import { formatDate } from '../utils/format.js'
import {
  EXAMPLE_VALUES,
  FIELD_ORDER,
  HOMELESS_OPTIONS,
  INITIAL_VALUES,
  MARITAL_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_SLOTS,
  REGION_OPTIONS,
  SUBSCRIPTION_OPTIONS,
  toFormValues,
  toPayload,
  validateCondition,
} from '../constants/condition.js'

// 시안의 "판정 대상 유형" 카드. 입력값이 아니라 안내용이라 폼 상태에 포함하지 않는다.
const HOUSING_TYPES = [
  {
    key: 'happy',
    name: '행복주택',
    badge: '진단 가능',
    description: '대학생, 청년, 신혼부부를 위해 대중교통이 편리한 곳에 짓는 공공임대주택',
    enabled: true,
  },
  {
    key: 'purchase',
    name: '매입임대',
    badge: '준비 중',
    description: '기존 다가구·다세대 주택을 매입하여 시세보다 저렴하게 청년층에 임대',
    enabled: false,
  },
  {
    key: 'jeonse',
    name: '전세임대',
    badge: '준비 중',
    description: '입주 대상자가 거주 희망 주택 선택 시 공공이 전세계약 체결 후 재임대',
    enabled: false,
  },
]

// 카드 안의 카드가 되지 않도록 박스 없이 나열한다. 선택된 유형은 이름 밑줄로 표시.
function HousingTypeCard({ type }) {
  if (type.enabled) {
    return (
      <div className="flex flex-col">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1">
          <span className="whitespace-nowrap border-b-2 border-accent pb-0.5 text-[15px] font-semibold text-accent-ink">
            {type.name}
          </span>
          <span className="text-[13px] font-semibold text-ok">{type.badge}</span>
        </div>
        <p className="text-[13px] leading-snug text-muted">{type.description}</p>
      </div>
    )
  }

  return (
    <div aria-disabled="true" className="flex cursor-not-allowed flex-col">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1">
        <span className="whitespace-nowrap pb-0.5 text-[15px] font-medium text-muted">{type.name}</span>
        <span className="text-[13px] text-muted">{type.badge}</span>
      </div>
      <p className="text-[13px] leading-snug text-muted">{type.description}</p>
    </div>
  )
}

export default function ConditionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  // 결과 화면의 '조건 수정하기'로 돌아오면 직전 입력값을 채워 둔다
  const [values, setValues] = useState(() =>
    location.state?.condition ? toFormValues(location.state.condition) : INITIAL_VALUES,
  )
  const [errors, setErrors] = useState({})
  // 백엔드 상태: 데이터 기준일 표시용. 서버가 꺼져 있으면 진단 전에 미리 알린다
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

  // 값이 바뀌면 그 필드의 에러만 걷어낸다
  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const { [name]: _removed, ...rest } = prev
      return rest
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateCondition(values)
    setErrors(nextErrors)

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name])
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus()
      return
    }

    navigate('/result', { state: { condition: toPayload(values) } })
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
      <div className="grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-11">
        <section className="flex flex-col gap-6 lg:col-span-5">
          <div>
            <h1 className="mb-4 text-[clamp(2rem,3.4vw,2.75rem)] font-semibold leading-[1.22] tracking-[-0.035em] text-accent-ink">
              오산시 청년 공공임대,
              <br />내 조건으로 확인하기
            </h1>
            <p className="max-w-md text-base leading-[1.65] text-muted sm:text-[17px]">
              조건을 입력하면 기본 자격 확인 결과와 참고용 주택 목록을 보여줍니다.
            </p>
          </div>
          <StepTracker current={1} />
          <p className="text-[14px] text-muted">입력값은 서버에 저장되지 않고 판정에만 사용됩니다.</p>
          {health.status === 'ok' && (
            <p className="text-[14px] text-muted">
              LH·GH 행복주택 공고 기준 · 데이터 기준일 {formatDate(health.dataAsOf)}
            </p>
          )}
          {health.status === 'down' && (
            <p role="alert" className="rounded-lg bg-error-container px-3.5 py-2.5 text-[14px] font-medium text-on-error-container">
              판정 서버에 연결하지 못했어요. 백엔드 서버가 켜져 있는지 확인해 주세요.
            </p>
          )}
        </section>

        <section className="rounded-xl bg-stage p-3 sm:p-5 lg:col-span-7">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white ring-1 ring-stage-line/50 p-6 sm:p-8"
          >
            <div className="mb-4 border-b border-line-soft pb-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-accent-ink">기본 조건 입력</h2>
                <button
                  type="button"
                  onClick={fillExample}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-line-strong bg-white px-4 text-[14px] font-medium text-ink transition-[transform,background-color] duration-150 ease-out hover:bg-accent-soft active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
                >
                  예시로 체험하기
                </button>
              </div>
              <p className="mt-1 text-[14px] text-muted">
                정확한 판정을 위해 현재 기준의 정보를 간단히 선택해 주세요.
              </p>
            </div>

            {hasErrors && (
              <p role="alert" className="mb-3 rounded-lg bg-error-container px-3.5 py-2 text-[14px] font-medium text-on-error-container">
                입력하지 않았거나 확인이 필요한 항목이 있어요.
              </p>
            )}

            <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
              <NumberField
                name="age"
                label="만 나이"
                unit="세"
                placeholder="예: 26"
                required
                value={values.age}
                error={errors.age}
                onChange={handleChange}
              />
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
              <NumberField
                name="assets"
                label="총 자산"
                unit="만원"
                placeholder="예: 5000"
                required
                value={values.assets}
                error={errors.assets}
                onChange={handleChange}
              />
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
              <SegmentedField
                name="marital_status"
                label="혼인 상태"
                options={MARITAL_OPTIONS}
                required
                value={values.marital_status}
                error={errors.marital_status}
                onChange={handleChange}
              />
              <SegmentedField
                name="homeless_status"
                label="무주택 여부"
                options={HOMELESS_OPTIONS}
                required
                value={values.homeless_status}
                error={errors.homeless_status}
                onChange={handleChange}
              />
              <SegmentedField
                name="subscription_account"
                label="청약통장 가입 여부"
                options={SUBSCRIPTION_OPTIONS}
                required
                value={values.subscription_account}
                error={errors.subscription_account}
                onChange={handleChange}
              />
              <SelectField
                name="region"
                label="희망 지역"
                options={REGION_OPTIONS}
                required
                value={values.region}
                error={errors.region}
                onChange={handleChange}
              />
              <NumberField
                name="max_rent"
                label="월 임대료 상한"
                optional
                unit="만원"
                placeholder="예: 30"
                hint="참고용 주택 목록에만 적용돼요. 자격 판정에는 쓰이지 않아요."
                value={values.max_rent}
                error={errors.max_rent}
                onChange={handleChange}
              />
              <NumberField
                name="desired_area"
                label="희망 전용면적"
                optional
                unit="평"
                placeholder="예: 10"
                value={values.desired_area}
                error={errors.desired_area}
                onChange={handleChange}
              />
              <NumberField
                name="max_deposit"
                label="보증금 상한"
                optional
                unit="만원"
                placeholder="예: 3000"
                value={values.max_deposit}
                error={errors.max_deposit}
                onChange={handleChange}
              />
              <DateField
                name="deadline_pref"
                label="희망 접수 마감 기한"
                optional
                hint="이 날짜까지 접수할 수 있는 공고를 찾을 때 써요."
                value={values.deadline_pref}
                error={errors.deadline_pref}
                onChange={handleChange}
              />
            </div>

            <div className="mt-5 border-t border-line-soft pt-3.5">
              <h3 className="text-[15px] font-semibold text-accent-ink">희망 조건 우선순위</h3>
              <p className="mb-3 mt-1 text-[13px] text-muted">
                더 중요한 조건부터 순서대로 골라 주세요. 비워 둬도 돼요.
              </p>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
                {PRIORITY_SLOTS.map((slot, index) => (
                  <SelectField
                    key={slot}
                    name={slot}
                    label={`${index + 1}순위`}
                    optional
                    // 다른 순위에서 이미 고른 항목은 고를 수 없게 막는다 (검증은 따로 유지)
                    options={PRIORITY_OPTIONS.map((option) => ({
                      ...option,
                      disabled:
                        option.value !== '' &&
                        PRIORITY_SLOTS.some(
                          (other) => other !== slot && values[other] === option.value,
                        ),
                    }))}
                    value={values[slot]}
                    error={errors[slot]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-line-soft pt-3.5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4">
                <h3 className="text-[15px] font-semibold text-accent-ink">판정 대상 유형</h3>
                <p className="text-[13px] text-muted">
                  진단하고자 하는 공공임대주택 유형을 선택하세요.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {HOUSING_TYPES.map((type) => (
                  <HousingTypeCard key={type.key} type={type} />
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-line-soft pt-3.5">
              <button
                type="submit"
                className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink transition-[transform,background-color] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
              >
                자격 진단하기
                <ArrowIcon />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
