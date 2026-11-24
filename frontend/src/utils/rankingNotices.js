
/**
 * 기존 공고 목록을 추천 알고리즘 입력 형식으로 변환
 *
 * 현재: housing.json에서 조회한 공고
 * 향후: 지민이 엑셀에서 변환한 공고 데이터
 */

export function buildRankingNotices(items = []) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    address: item.address ?? null,

    // 동 단위 지역 정보는 현재 충분하지 않음
    region: null,

    // 면적과 보증금은 참고값
    area_sqm: item.area ?? null,
    deposit: item.deposit ?? null,

    // 검증되지 않은 참고 월세는 추천 점수에 사용하지 않음
    applicable_monthly_rent: item.applicableRent ?? null,

    // 모집기간
    application_start: item.recruitStart ?? null,
    application_end: item.recruitEnd ?? null,

    // 마감 상태 유지
    notice_status:
      item.recruitmentStatus === 'closed'
        ? 'closed'
        : null,

    // 공고 원문
    notice_url: item.noticeUrl ?? null,
  }))
}
