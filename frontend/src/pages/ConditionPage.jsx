import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NumberField from '../components/form/NumberField.jsx'
import SegmentedField from '../components/form/SegmentedField.jsx'
import SelectField from '../components/form/SelectField.jsx'
import StepTracker from '../components/StepTracker.jsx'
import {
  FIELD_ORDER,
  HOMELESS_OPTIONS,
  INITIAL_VALUES,
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
    badge: '오산도시공사 연계 예정',
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

function HousingTypeCard({ type }) {
  if (type.enabled) {
    return (
      <div className="flex flex-col rounded-xl border-2 border-accent bg-accent-soft p-3">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[16px] text-accent"
              style={{ fontVariationSettings: '"FILL" 1' }}
              aria-hidden="true"
            >
              check_circle
            </span>
            <span className="whitespace-nowrap text-[14px] font-bold text-ink">{type.name}</span>
          </div>
          <span className="inline-flex items-center rounded-full bg-ok-soft px-2 py-0.5 text-[13px] font-semibold text-ok">
            {type.badge}
          </span>
        </div>
        <p className="text-[13px] leading-tight text-muted">{type.description}</p>
      </div>
    )
  }

  return (
    <div
      aria-disabled="true"
      className="flex cursor-not-allowed flex-col rounded-xl border border-line-soft bg-surface-container-low p-3 opacity-80"
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 text-subtle">
          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
            remove
          </span>
          <span className="whitespace-nowrap text-[14px] font-semibold">{type.name}</span>
        </div>
        <span className="inline-flex items-center rounded-full bg-surface-container px-2 py-0.5 text-[13px] font-medium text-subtle">
          {type.badge}
        </span>
      </div>
      <p className="text-[13px] leading-tight text-muted">{type.description}</p>
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
            <h1 className="mb-3 text-[32px] font-bold leading-[1.22] tracking-tight text-ink lg:text-[44px]">
              오산시 청년 공공임대,
              <br />내 조건으로 확인하기
            </h1>
            <p className="max-w-md text-[15.5px] leading-relaxed text-subtle">
              조건을 입력하면 신청 가능한 유형과 맞춤 주택 목록을 바로 보여줍니다.
            </p>
          </div>
          <StepTracker current={1} />
          <div className="flex items-center gap-2.5 rounded-2xl border border-line-soft bg-accent-soft/70 px-3.5 py-2.5 text-[13px] text-subtle">
            <span
              className="material-symbols-outlined text-[18px] text-accent"
              style={{ fontVariationSettings: '"FILL" 1' }}
              aria-hidden="true"
            >
              lock
            </span>
            <span>입력값은 저장되지 않으며 판정에만 사용됩니다.</span>
          </div>
        </section>

        <section className="lg:col-span-7">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="rounded-[20px] border border-line-soft bg-white p-7 shadow-card"
          >
            <div className="mb-4 border-b border-line-soft pb-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                <h2 className="text-[18px] font-bold text-ink">기본 조건 입력</h2>
              </div>
              <p className="mt-0.5 pl-[18px] text-[13px] text-subtle">
                정확한 판정을 위해 현재 기준의 정보를 간단히 선택해 주세요.
              </p>
            </div>

            {hasErrors && (
              <p role="alert" className="mb-3 rounded-xl bg-error-container px-3.5 py-2 text-[13px] font-medium text-on-error-container">
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
                unit="만원"
                placeholder="예: 30"
                value={values.max_rent}
                error={errors.max_rent}
                onChange={handleChange}
              />
            </div>

            <div className="mt-5 border-t border-line-soft pt-3.5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4">
                <h3 className="text-[14px] font-bold text-ink">판정 대상 유형</h3>
                <p className="text-[13px] text-subtle">
                  진단하고자 하는 공공임대주택 유형을 선택하세요.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {HOUSING_TYPES.map((type) => (
                  <HousingTypeCard key={type.key} type={type} />
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-line-soft pt-3.5">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-base font-bold text-accent-ink shadow-md shadow-accent/30 transition-all hover:bg-accent-hover active:scale-[0.98]"
              >
                <span>자격 진단하기</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
