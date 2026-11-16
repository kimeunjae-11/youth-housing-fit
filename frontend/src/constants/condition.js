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

// 동 단위 지역은 공고 데이터에 동 정보(district)가 아직 없어 항상 0건이 나온다.
// 데이터가 채워지기 전까지 선택하지 못하게 막아 둔다. (disabled: true 를 지우면 다시 열림)
export const REGION_OPTIONS = [
  { value: 'all', label: '오산시 전체' },
  { value: 'segyo1', label: '오산시 세교1지구 (준비 중)', disabled: true },
  { value: 'segyo2', label: '오산시 세교2지구 (준비 중)', disabled: true },
  { value: 'wondong', label: '오산시 원동 / 오산역 인근 (준비 중)', disabled: true },
  { value: 'gajang', label: '오산시 가장동 / 갈곶동 (준비 중)', disabled: true },
]

export const INITIAL_VALUES = {
  age: '',
  income: '',
  assets: '',
  car_value: '',
  marital_status: '',
  homeless_status: '',
  subscription_account: '',
  region: 'all',
  max_rent: '',
  // 희망 조건 (모두 선택 입력). 백엔드 필드명이 정해지면 request.js 에서 매핑한다.
  desired_area: '',
  max_deposit: '',
  deadline_pref: '',
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
  region: 'all',
  max_rent: '',
  desired_area: '',
  max_deposit: '',
  deadline_pref: '',
}

// 에러 포커스 이동 순서 (화면 위→아래, 왼→오른쪽)
export const FIELD_ORDER = [
  'age',
  'income',
  'assets',
  'car_value',
  'marital_status',
  'homeless_status',
  'subscription_account',
  'region',
  'max_rent',
  'desired_area',
  'max_deposit',
  'deadline_pref',
]

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

  return errors
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
    region: values.region,
    max_rent: isBlank(values.max_rent) ? null : Number(values.max_rent),
    desired_area: isBlank(values.desired_area) ? null : Number(values.desired_area),
    max_deposit: isBlank(values.max_deposit) ? null : Number(values.max_deposit),
    deadline_pref: isBlank(values.deadline_pref) ? null : values.deadline_pref,
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
    region: payload.region,
    max_rent: payload.max_rent == null ? '' : String(payload.max_rent),
    desired_area: payload.desired_area == null ? '' : String(payload.desired_area),
    max_deposit: payload.max_deposit == null ? '' : String(payload.max_deposit),
    deadline_pref: payload.deadline_pref ?? '',
  }
}
