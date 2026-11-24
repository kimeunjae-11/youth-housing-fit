// 조건 입력 폼의 필드 정의.
// 이 파일의 필드 이름·단위(만원)는 화면용이다. 백엔드 요청 JSON(원 단위·boolean)으로의 변환은 src/api/request.js 에서 한다.

export const AGE_RANGE = { min: 19, max: 39 }

export const HOMELESS_OPTIONS = [
  { value: 'homeless', label: '무주택 (세대원 전원)' },
  { value: 'homeowner', label: '주택 보유' },
]

export const MARITAL_OPTIONS = [
  { value: 'single', label: '미혼' },
  { value: 'married', label: '기혼' },
]

export const SUBSCRIPTION_OPTIONS = [
  { value: 'active', label: '가입 (청약저축)' },
  { value: 'none', label: '미가입' },
]

// 학생·구직 상태 (선택 입력). 정책 추천의 대학생·취업준비생 요건에 쓴다.
export const ACTIVITY_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'student', label: '대학생 (재학·휴학 포함)' },
  { value: 'job_seeker', label: '취업준비생' },
  { value: 'none', label: '해당 없음 (직장인 등)' },
]

// 선호 임대 방식. 정책 추천에서 같은 조건이면 이 방식의 정책을 먼저 고른다. (백엔드 rental_preference)
export const RENTAL_PREFERENCE_OPTIONS = [
  { value: 'public_complex', label: '공공임대 단지 (행복주택·통합공공임대)' },
  { value: 'find_jeonse', label: '직접 찾은 집에 전세 (전세임대)' },
  { value: 'existing_public_home', label: '기존 주택을 매입한 임대 (매입임대)' },
  { value: 'private_rental', label: '민간임대 (공공지원민간임대)' },
  { value: '', label: '상관없음' },
]

// 동 단위 지역은 공고 데이터에 동 정보(district)가 아직 없어 항상 0건이 나온다.
// 데이터가 채워지기 전까지 선택하지 못하게 막아 둔다. (disabled: true 를 지우면 다시 열림)
export const REGION_OPTIONS = [
  { value: 'all', label: '오산시 전체' },
  { value: 'segyo1', label: '오산시 세교1지구 (준비 중)', disabled: true },
  { value: 'segyo2', label: '오산시 세교2지구 (준비 중)', disabled: true },
  { value: 'wondong', label: '오산시 원동 / 오산역 인근 (준비 중)', disabled: true },
  { value: 'gajang', label: '오산시 가장동 / 갈곶동 (준비 중)', disabled: true },
]

// 희망 조건 우선순위: 순위(1~3)마다 아래 항목 중 하나를 고른다. (선택 입력)
export const PRIORITY_SLOTS = ['priority_1', 'priority_2', 'priority_3']

export const PRIORITY_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'max_monthly_rent', label: '월 임대료 상한' },
  { value: 'max_deposit', label: '보증금 상한' },
  { value: 'desired_area', label: '희망 전용면적' },
  { value: 'deadline_pref', label: '희망 접수 마감 기한' },
]

export const INITIAL_VALUES = {
  age: '',
  income: '',
  assets: '',
  car_value: '',
  marital_status: '',
  homeless_status: '',
  subscription_account: '',
  student_status: '',
  region: 'all',
  rental_preference: 'public_complex',
  max_rent: '',
  // 희망 조건 (모두 선택 입력). 백엔드 필드명이 정해지면 request.js 에서 매핑한다.
  desired_area: '',
  max_deposit: '',
  deadline_pref: '',
  priority_1: '',
  priority_2: '',
  priority_3: '',
}

// '예시로 체험하기' 버튼이 채우는 값. 기본 조건을 충족하는 청년 1인 가구 예시
export const EXAMPLE_VALUES = {
  age: '26',
  income: '250',
  assets: '5000',
  car_value: '0',
  marital_status: 'single',
  homeless_status: 'homeless',
  subscription_account: 'active',
  student_status: '',
  region: 'all',
  rental_preference: 'public_complex',
  max_rent: '',
  desired_area: '',
  max_deposit: '',
  deadline_pref: '',
  priority_1: '',
  priority_2: '',
  priority_3: '',
}

// 조건 입력 화면의 단계. 한 화면에 한 단계씩 보여주고, 다음으로 넘어갈 때 그 단계의 필드만 검증한다.
export const CONDITION_STEPS = [
  {
    key: 'basic',
    title: '기본 정보',
    description: '정확한 판정을 위해 현재 기준의 정보를 간단히 선택해 주세요.',
    fields: ['age', 'marital_status', 'homeless_status', 'subscription_account', 'student_status'],
  },
  {
    key: 'finance',
    title: '소득·자산',
    description: '본인 1인 가구 기준으로 입력해 주세요.',
    fields: ['income', 'assets', 'car_value'],
  },
  {
    key: 'preference',
    title: '희망 조건',
    description: '정책 추천과 추천 주택을 고를 때 쓰는 조건이에요. 비워 둬도 돼요.',
    fields: [
      'region',
      'rental_preference',
      'max_rent',
      'desired_area',
      'max_deposit',
      'deadline_pref',
      'priority_1',
      'priority_2',
      'priority_3',
    ],
  },
]

// 에러 포커스 이동 순서 (단계 순서 → 화면 위→아래, 왼→오른쪽)
export const FIELD_ORDER = CONDITION_STEPS.flatMap((step) => step.fields)

const isBlank = (value) => String(value).trim() === ''

function checkNonNegativeInteger(value, label) {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 0) {
    return `${label}은(는) 0 이상의 정수로 입력해 주세요.`
  }
  return null
}

// 'YYYY-MM-DD' 형식이면서 실제로 있는 날짜인지 (예: 2026-02-31 은 거부)
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function validateCondition(values) {
  const errors = {}

  if (isBlank(values.age)) {
    errors.age = '만 나이를 입력해 주세요.'
  } else {
    const age = Number(values.age)
    if (!Number.isInteger(age) || age < AGE_RANGE.min || age > AGE_RANGE.max) {
      errors.age = `만 ${AGE_RANGE.min}세 이상 ${AGE_RANGE.max}세 이하의 청년 연령을 입력해 주세요.`
    }
  }

  if (isBlank(values.income)) {
    errors.income = '월 평균 소득을 입력해 주세요.'
  } else {
    const message = checkNonNegativeInteger(values.income, '월 평균 소득')
    if (message) errors.income = message
  }

  if (isBlank(values.assets)) {
    errors.assets = '총 자산을 입력해 주세요.'
  } else {
    const message = checkNonNegativeInteger(values.assets, '총 자산')
    if (message) errors.assets = message
  }

  // 자동차 가액은 선택 입력: 비워 두면 '추가 확인 필요'로 남는다. 차량이 없으면 0 을 입력한다.
  if (!isBlank(values.car_value)) {
    const message = checkNonNegativeInteger(values.car_value, '자동차 가액')
    if (message) errors.car_value = message
  }

  if (!values.marital_status) {
    errors.marital_status = '혼인 상태를 선택해 주세요.'
  }

  if (!values.homeless_status) {
    errors.homeless_status = '무주택 여부를 선택해 주세요.'
  }

  if (!values.subscription_account) {
    errors.subscription_account = '청약통장 가입 여부를 선택해 주세요.'
  }

  if (!values.region) {
    errors.region = '희망 지역을 선택해 주세요.'
  }

  // 월 임대료 상한은 선택 입력: 비워 두면 통과, 입력했다면 형식만 검사
  if (!isBlank(values.max_rent)) {
    const message = checkNonNegativeInteger(values.max_rent, '월 임대료 상한')
    if (message) errors.max_rent = message
  }

  // 희망 조건은 모두 선택 입력: 비워 두면 통과, 입력했다면 형식만 검사
  if (!isBlank(values.desired_area)) {
    const area = Number(values.desired_area)
    if (!Number.isInteger(area) || area <= 0) {
      errors.desired_area = '전용면적은 0보다 큰 정수로 입력해 주세요.'
    }
  }

  if (!isBlank(values.max_deposit)) {
    const message = checkNonNegativeInteger(values.max_deposit, '보증금 상한')
    if (message) errors.max_deposit = message
  }

  if (!isBlank(values.deadline_pref) && !isValidDate(values.deadline_pref)) {
    errors.deadline_pref = '날짜를 올바르게 입력해 주세요.'
  }

  // 우선순위는 선택 입력: 전부 비워도, 1순위만 골라도 통과.
  // 앞 순위를 비우고 뒤 순위만 고르거나, 같은 항목을 두 순위에 고르면 에러.
  const chosen = []
  PRIORITY_SLOTS.forEach((slot, index) => {
    const value = values[slot]
    if (!value) return
    if (index > 0 && !values[PRIORITY_SLOTS[index - 1]]) {
      errors[slot] = `${index}순위를 먼저 선택해 주세요.`
    } else if (chosen.includes(value)) {
      errors[slot] = '이미 다른 순위에서 고른 항목이에요. 다른 항목을 골라 주세요.'
    }
    chosen.push(value)
  })

  return errors
}

// 한 단계(stepIndex)에 속한 필드의 에러만 돌려준다. 검증 규칙 자체는 validateCondition 하나만 쓴다.
export function validateStep(values, stepIndex) {
  const errors = validateCondition(values)
  const fields = CONDITION_STEPS[stepIndex].fields
  return Object.fromEntries(Object.entries(errors).filter(([name]) => fields.includes(name)))
}

// 폼 문자열 값 → 요청 JSON. 금액·나이는 숫자, 비운 선택 입력은 null
export function toPayload(values) {
  return {
    age: Number(values.age),
    income: Number(values.income),
    assets: Number(values.assets),
    car_value: isBlank(values.car_value) ? null : Number(values.car_value),
    marital_status: values.marital_status,
    homeless_status: values.homeless_status,
    subscription_account: values.subscription_account,
    student_status: values.student_status || null,
    region: values.region,
    rental_preference: values.rental_preference || null,
    max_rent: isBlank(values.max_rent) ? null : Number(values.max_rent),
    desired_area: isBlank(values.desired_area) ? null : Number(values.desired_area),
    max_deposit: isBlank(values.max_deposit) ? null : Number(values.max_deposit),
    deadline_pref: isBlank(values.deadline_pref) ? null : values.deadline_pref,
    // 순위 순서대로 항목 키 배열. 비운 순위는 뺀다.
    priorities: PRIORITY_SLOTS.map((slot) => values[slot]).filter(Boolean),
  }
}

// 요청 JSON → 폼 문자열 값 (toPayload 의 역변환). 조건 수정으로 돌아올 때 입력창을 채운다
export function toFormValues(payload) {
  return {
    age: String(payload.age),
    income: String(payload.income),
    assets: String(payload.assets),
    car_value: payload.car_value == null ? '' : String(payload.car_value),
    marital_status: payload.marital_status ?? '',
    homeless_status: payload.homeless_status,
    subscription_account: payload.subscription_account,
    student_status: payload.student_status ?? '',
    region: payload.region,
    rental_preference: payload.rental_preference === undefined ? 'public_complex' : (payload.rental_preference ?? ''),
    max_rent: payload.max_rent == null ? '' : String(payload.max_rent),
    desired_area: payload.desired_area == null ? '' : String(payload.desired_area),
    max_deposit: payload.max_deposit == null ? '' : String(payload.max_deposit),
    deadline_pref: payload.deadline_pref ?? '',
    priority_1: payload.priorities?.[0] ?? '',
    priority_2: payload.priorities?.[1] ?? '',
    priority_3: payload.priorities?.[2] ?? '',
  }
}
