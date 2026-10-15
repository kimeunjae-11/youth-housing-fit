import { formatKrw } from '../utils/format.js'
import { postJson } from './client.js'
import { buildRequest } from './request.js'

const HOUSING_TYPE = 'happy-youth' // 행복주택 청년계층
const UNAVAILABLE_MESSAGE = '자격 판정 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'

const MONEY_FIELDS = new Set(['monthly_income', 'total_assets', 'car_value'])

// 백엔드 check 의 input_value 를 화면에 보여줄 문장으로 바꾼다
function formatInput(check) {
  const value = check.input_value
  if (value === null || value === undefined) return '입력 안 함'
  if (MONEY_FIELDS.has(check.field)) return formatKrw(value)
  switch (check.field) {
    case 'age':
      return `${value}세`
    case 'homeless':
      return value ? '무주택' : '주택 보유'
    case 'marital_status':
      return value === 'single' ? '혼인 중 아님' : '혼인 중'
    case 'housing_subscription':
      return value ? '가입' : '미가입'
    default:
      return String(value)
  }
}

// 백엔드 check 의 criterion 을 화면에 보여줄 문장으로 바꾼다
function formatCriterion(check) {
  const { criterion } = check
  if (MONEY_FIELDS.has(check.field)) {
    return criterion?.max == null ? '기준 확인 필요' : `${formatKrw(criterion.max)} 이하`
  }
  switch (check.field) {
    case 'age':
      return `만 ${criterion.min}세 ~ ${criterion.max}세`
    case 'homeless':
      return '본인 무주택'
    case 'marital_status':
      return '혼인 중이 아닐 것'
    case 'housing_subscription':
      return '입주 전까지 가입'
    default:
      return String(criterion)
  }
}

// 추가 확인 항목의 field 이름을 화면 문구로. notice_rule 은 공고문 규칙 중 아직 구현하지 않은 예외다.
function reviewLabel(field, items) {
  if (field === 'notice_rule') return '공고문 예외 규칙'
  return items.find((item) => item.key === field)?.label ?? field
}

/**
 * 자격 판정
 * 항목별 verdict 는 met(충족) / not_met(미충족) / unknown(확인 필요) 세 가지다.
 * status 가 needs_review 이면 검사한 항목에 미충족은 없지만 추가 확인이 남았다는 뜻이라 '신청 가능'으로 보여주면 안 된다.
 * @param {ReturnType<typeof import('../constants/condition.js').toPayload>} condition 폼 요청 변환 결과
 * @returns {Promise<{
 *   type: string,
 *   status: 'met' | 'not_met' | 'needs_review',
 *   basicStatus: string,
 *   basicMessage: string,
 *   assessedCount: number,
 *   unknownCount: number,
 *   items: { key: string, label: string, input: string, criterion: string, verdict: 'met' | 'not_met' | 'unknown', reason: string }[],
 *   additionalReview: { label: string, reason: string }[],
 *   criteriaSource: string,
 *   criteriaDate: string,
 *   sourceUrl: string | null,
 *   sourceNote: string | null,
 * }>}
 * @throws {ApiError}
 */
export async function checkEligibility(condition) {
  const data = await postJson('/api/eligibility', buildRequest(condition), UNAVAILABLE_MESSAGE)

  const items = (data.checks ?? []).map((check) => ({
    key: check.field,
    label: check.label,
    input: formatInput(check),
    criterion: formatCriterion(check),
    verdict: check.status,
    reason: check.reason,
  }))

  return {
    type: HOUSING_TYPE,
    status: data.status,
    basicStatus: data.basic_status,
    basicMessage: data.basic_message,
    assessedCount: data.assessed_count,
    unknownCount: data.unknown_count,
    items,
    additionalReview: (data.additional_review ?? []).map((review) => ({
      label: reviewLabel(review.field, items),
      reason: review.reason,
    })),
    criteriaSource: data.scope,
    criteriaDate: data.basis_date,
    sourceUrl: data.source_url ?? null,
    sourceNote: data.source_note ?? null,
  }
}
