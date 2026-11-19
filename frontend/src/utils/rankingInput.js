
/**
 * 사용자 희망조건을
 * 추천 알고리즘 입력 형식으로 변환
 */

const WON_PER_MAN = 10000
const SQM_PER_PYEONG = 3.305785

// 우선순위 항목 → 추천 점수 항목
const PRIORITY_TO_WEIGHT = {
  max_monthly_rent: 'rent',
  max_deposit: 'deposit',
  desired_area: 'area',
  deadline_pref: 'deadline',
}

// 기본 가중치 (우선순위를 선택하지 않았을 때)
const DEFAULT_WEIGHTS = {
  region: 30,
  rent: 30,
  area: 20,
  deposit: 20,
  deadline: 0,
}

// 빈 값은 null로 유지
function optionalNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// 사용자 1~3순위를 가중치로 변환
export function buildPriorityWeights(priorities = []) {
  if (!Array.isArray(priorities) || priorities.length === 0) {
    return { ...DEFAULT_WEIGHTS }
  }

  const weights = {
    region: 0,
    rent: 0,
    area: 0,
    deposit: 0,
    deadline: 0,
  }

  // 1순위 50, 2순위 30, 3순위 20
  const scores = [50, 30, 20]

  priorities.slice(0, 3).forEach((priority, index) => {
    const key = PRIORITY_TO_WEIGHT[priority]

    if (key) {
      weights[key] = scores[index]
    }
  })

  return weights
}

//  입력값 → 추천 API용 데이터
export function buildRankingInput(condition) {
  const rent = optionalNumber(condition.max_rent)
  const area = optionalNumber(condition.desired_area)
  const deposit = optionalNumber(condition.max_deposit)

  const preferences = {
    // 오산시 전체는 특정 지역 선호로 점수화하지 않음
    region:
      condition.region === 'all'
        ? null
        : condition.region,

    max_monthly_rent:
      rent === null ? null : rent * WON_PER_MAN,

    min_area_sqm:
      area === null
        ? null
        : Math.round(area * SQM_PER_PYEONG * 100) / 100,

    max_deposit:
      deposit === null ? null : deposit * WON_PER_MAN,

    deadline_pref: condition.deadline_pref || null,
  }

  const weights = buildPriorityWeights(condition.priorities)

  return {
    preferences,
    weights,
  }
}
