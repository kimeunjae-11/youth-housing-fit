// 폼 값(condition) → 백엔드 요청 JSON.
// 화면 쪽 condition 은 만원 단위·선택 코드이고, 백엔드는 원 단위·boolean·지역 이름을 받는다.

const WON_PER_MAN = 10_000

// 희망 지역 코드 → 백엔드 region 문자열.
// 백엔드는 '오산시 전체' 또는 공고의 district 와 정확히 같은 동 이름만 거른다.
// 현재 공고 데이터는 district 가 모두 null 이라 동 단위 지역은 결과가 0건일 수 있다. (docs/backend-api.md)
const REGION_TO_API = {
  all: '오산시 전체',
  segyo1: '세교동',
  segyo2: '세교동',
  wondong: '원동',
  gajang: '가장동',
}

/**
 * @param {ReturnType<typeof import('../constants/condition.js').toPayload>} condition
 */
export function buildRequest(condition) {
  const request = {
    age: condition.age,
    monthly_income: condition.income * WON_PER_MAN,
    total_assets: condition.assets * WON_PER_MAN,
    homeless: condition.homeless_status === 'homeless',
    housing_subscription: condition.subscription_account === 'active',
    marital_status: condition.marital_status,
    region: REGION_TO_API[condition.region] ?? condition.region,
    // 폼의 소득 안내가 '본인 1인 가구 기준'이라 본인 심사·1인 가구로 보낸다.
    // 자녀 수는 묻지 않으므로 0명으로 보낸다. 값이 없으면 소득·자산이 모두 '확인 필요'가 된다.
    income_scope: 'self',
    household_size: 1,
    children_after_20230328: 0,
    // car_value 는 폼에 없어 보내지 않는다. 자동차 가액은 '추가 확인 필요' 항목으로 남는다.
  }
  if (condition.max_rent != null) {
    request.max_monthly_rent = condition.max_rent * WON_PER_MAN
  }
  return request
}
