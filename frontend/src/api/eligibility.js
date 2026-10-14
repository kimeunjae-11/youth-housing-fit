import { AGE_RANGE, HOMELESS_OPTIONS, SUBSCRIPTION_OPTIONS } from '../constants/condition.js'
import { ApiError, delay } from './mockUtils.js'

// ─────────────────────────────────────────────────────────────
// [임시] 기준값 정리 후 교체
// 아래 판정 기준값은 실제 공고·고시 값이 아니라 시안(02-result.png)에서 옮긴 임시 값이다.
// ─────────────────────────────────────────────────────────────
const HOUSING_TYPE = 'happy-youth' // 행복주택 청년계층
const INCOME_LIMIT = 287 // 만원/월. [임시] 기준 중위소득 120% (1인 가구)
const ASSET_LIMIT = 27300 // 만원. [임시] 총자산 2억 7,300만원
const CRITERIA_SOURCE = '[임시] 행복주택 청년계층 입주자격 (기준값 정리 전)'
const CRITERIA_DATE = '2026-10-12'

// 목업 에러 확인용: 총자산을 이 값으로 입력하면 판정 요청이 실패한다. (실제 API 연동 시 삭제)
export const MOCK_ERROR_ASSETS = 9999

const won = (value) => `${value.toLocaleString('ko-KR')}만원`
const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value

/**
 * 자격 판정 (목업)
 * @param {ReturnType<typeof import('../constants/condition.js').toPayload>} condition 폼 요청 변환 결과
 * @returns {Promise<{
 *   type: string,
 *   eligible: boolean,
 *   items: { key: string, label: string, input: string, criterion: string, passed: boolean, reason: string }[],
 *   criteriaSource: string,
 *   criteriaDate: string,
 * }>}
 * @throws {ApiError}
 */
export async function checkEligibility(condition) {
  await delay()

  if (condition.assets === MOCK_ERROR_ASSETS) {
    throw new ApiError('자격 판정 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.', 'ELIGIBILITY_UNAVAILABLE')
  }

  const items = [
    {
      key: 'age',
      label: '만 나이',
      input: `${condition.age}세`,
      criterion: `만 ${AGE_RANGE.min}세 ~ ${AGE_RANGE.max}세 이하`,
      passed: condition.age >= AGE_RANGE.min && condition.age <= AGE_RANGE.max,
      reason: '청년 연령 범위 안에 있어요.',
    },
    {
      key: 'income',
      label: '월 평균 소득',
      input: won(condition.income),
      criterion: `기준 중위소득 120% 이하 (${won(INCOME_LIMIT)})`,
      passed: condition.income <= INCOME_LIMIT,
      reason: '소득 기준 이내예요.',
    },
    {
      key: 'assets',
      label: '총 자산',
      input: won(condition.assets),
      criterion: `총자산 ${won(ASSET_LIMIT)} 이하`,
      passed: condition.assets <= ASSET_LIMIT,
      reason: '자산 기준 이내예요.',
    },
    {
      key: 'homeless',
      label: '무주택 여부',
      input: labelOf(HOMELESS_OPTIONS, condition.homeless_status),
      criterion: '본인 무주택 요건 충족',
      passed: condition.homeless_status === 'homeless',
      reason: '무주택 요건을 충족해요.',
    },
    {
      key: 'subscription',
      label: '청약통장',
      input: labelOf(SUBSCRIPTION_OPTIONS, condition.subscription_account),
      criterion: '입주 전까지 가입 유지',
      passed: condition.subscription_account === 'active',
      reason: '청약통장 가입 요건을 충족해요.',
    },
  ].map((item) => (item.passed ? item : { ...item, reason: failReason(item) }))

  return {
    type: HOUSING_TYPE,
    eligible: items.every((item) => item.passed),
    items,
    criteriaSource: CRITERIA_SOURCE,
    criteriaDate: CRITERIA_DATE,
  }
}

// 불충족 사유 문구. 충족일 때의 reason 은 위 items 정의에 둔다.
function failReason(item) {
  switch (item.key) {
    case 'age':
      return '청년 연령 범위를 벗어났어요.'
    case 'income':
      return '소득 기준을 초과했어요.'
    case 'assets':
      return '자산 기준을 초과했어요.'
    case 'homeless':
      return '주택 보유 세대는 신청할 수 없어요.'
    case 'subscription':
      return '청약통장 가입이 필요해요.'
    default:
      return '기준을 충족하지 못했어요.'
  }
}
