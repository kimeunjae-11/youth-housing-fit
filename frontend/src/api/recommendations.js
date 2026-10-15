import { postJson } from './client.js'
import { buildRequest } from './request.js'

const UNAVAILABLE_MESSAGE = '추천 공고 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'

/**
 * 참고용 공고 탐색 (지역·월세 기준)
 * 자격 판정과는 별개의 목록이라 '신청 가능한 공고'로 보여주면 안 된다. 마감된 공고도 포함된다.
 * 금액은 원 단위 그대로 둔다. monthly_rent·deposit 은 요약 참고 가격이고, 사용자에게 적용되는 임대료는
 * applicableRent 이다. 확인되지 않았으면 null 이다.
 * @throws {ApiError}
 * @param {ReturnType<typeof import('../constants/condition.js').toPayload>} condition 폼 요청 변환 결과
 * @returns {Promise<{
 *   dataDate: string,
 *   message: string,
 *   items: {
 *     id: string, name: string, address: string, area: number | null,
 *     deposit: number | null, referenceRent: number | null, applicableRent: number | null,
 *     rentNeedsReview: boolean, priceLabel: string,
 *     recruitStart: string | null, recruitEnd: string | null,
 *     recruitmentStatus: string, statusLabel: string,
 *     noticeUrl: string | null, matchReasons: string[], cautions: string[],
 *   }[],
 * }>}
 */
export async function fetchRecommendations(condition) {
  const data = await postJson('/api/recommendations', buildRequest(condition), UNAVAILABLE_MESSAGE)

  const items = (data.results ?? []).map((listing) => ({
    id: listing.id,
    name: listing.name,
    address: listing.address,
    area: listing.area_sqm ?? null,
    deposit: listing.deposit ?? null,
    referenceRent: listing.monthly_rent ?? null,
    applicableRent: listing.applicable_monthly_rent ?? null,
    rentNeedsReview: listing.rent_needs_review === true,
    priceLabel: listing.price_label,
    recruitStart: listing.application_start ?? null,
    recruitEnd: listing.application_end ?? null,
    recruitmentStatus: listing.recruitment_status,
    statusLabel: listing.status_label,
    noticeUrl: listing.notice_url ?? null,
    matchReasons: listing.match_reasons ?? [],
    cautions: listing.cautions ?? [],
  }))

  return { dataDate: data.data_as_of, message: data.message, items }
}
