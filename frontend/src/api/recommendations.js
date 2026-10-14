import { ApiError, delay } from "./mockUtils.js";

// ─────────────────────────────────────────────────────────────
// [임시] 기준값 정리 후 교체
// 아래 공고 데이터는 시안(03-recommend.png)에서 옮긴 임시 목업이다. 금액은 모두 만원 단위.
// noticeUrl 은 실제 공고 링크가 아니라 LH 청약플러스 첫 화면 자리표시자다.
// ─────────────────────────────────────────────────────────────
const DATA_DATE = "2026-10-12";
const NOTICE_URL = "https://apply.lh.or.kr";

// ─────────────────────────────────────────────────────────────
// [임시] API 연동 시 제거
// 화면의 0건·에러 상태를 재현하기 위한 목업 트리거 값.
//  - 월 임대료 상한이 MOCK_EMPTY_MAX_RENT 이면 빈 목록 (rent: null 공고도 제외하는 예외 케이스)
//  - 월 임대료 상한이 MOCK_ERROR_MAX_RENT 이면 ApiError (자격 판정 단계를 통과해 /recommend 에서 재현하려고 max_rent 를 씀)
// ─────────────────────────────────────────────────────────────
const MOCK_EMPTY_MAX_RENT = 1;
const MOCK_ERROR_MAX_RENT = 9999;

const MOCK_LISTINGS = [
  {
    id: "osan-segyo-a",
    name: "오산 세교 행복주택 A단지",
    address: "경기도 오산시 세교동",
    area: 26,
    deposit: 2400,
    rent: 14,
    recruitStart: "2026-10-01",
    recruitEnd: "2026-10-31",
    noticeUrl: NOTICE_URL,
  },
  {
    id: "osan-gwoldong-youth",
    name: "오산 궐동 행복주택 청년형",
    address: "경기도 오산시 궐동",
    area: 21,
    deposit: 2800,
    rent: 16,
    recruitStart: "2026-10-05",
    recruitEnd: "2026-11-05",
    noticeUrl: NOTICE_URL,
  },
  {
    id: "osan-cheongho-b",
    name: "오산 청호 행복주택 B단지",
    address: "경기도 오산시 청호동",
    area: 36,
    deposit: 3200,
    rent: 19,
    recruitStart: "2026-10-08",
    recruitEnd: "2026-11-12",
    noticeUrl: NOTICE_URL,
  },
  {
    id: "osan-gajang-youth",
    name: "오산 가장 공공임대 청년",
    address: "경기도 오산시 가장동",
    area: 29,
    deposit: 3500,
    rent: 21,
    recruitStart: "2026-10-12",
    recruitEnd: "2026-11-20",
    noticeUrl: NOTICE_URL,
  },
  {
    // 공고문에 임대료가 아직 없는 경우: rent 는 null 로 내려온다
    id: "osan-wondong-pending",
    name: "오산 원동 행복주택",
    address: "경기도 오산시 원동",
    area: 24,
    deposit: 2600,
    rent: null,
    recruitStart: "2026-10-15",
    recruitEnd: "2026-11-25",
    noticeUrl: NOTICE_URL,
  },
];

/**
 * 맞춤 추천 공고 (목업)
 * 월 임대료 상한(max_rent)이 있으면 그보다 비싼 공고는 뺀다. 임대료를 알 수 없는(null) 공고는 남긴다.
 * 단, 위 [임시] 트리거 값이 들어오면 빈 목록을 돌려주거나 ApiError 를 던진다.
 * @throws {ApiError}
 * @param {ReturnType<typeof import('../constants/condition.js').toPayload>} condition 폼 요청 변환 결과
 * @returns {Promise<{
 *   dataDate: string,
 *   items: {
 *     id: string, name: string, address: string, area: number, deposit: number,
 *     rent: number | null, recruitStart: string, recruitEnd: string, noticeUrl: string,
 *   }[],
 * }>}
 */
export async function fetchRecommendations(condition) {
  await delay();

  if (condition.max_rent === MOCK_ERROR_MAX_RENT) {
    throw new ApiError(
      "추천 공고 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
      "RECOMMENDATIONS_UNAVAILABLE",
    );
  }

  const maxRent = condition.max_rent;
  if (maxRent === MOCK_EMPTY_MAX_RENT) {
    return { dataDate: DATA_DATE, items: [] };
  }

  const items = MOCK_LISTINGS.filter(
    (listing) =>
      maxRent == null || listing.rent == null || listing.rent <= maxRent,
  ).map((listing) => ({ ...listing }));

  return { dataDate: DATA_DATE, items };
}
