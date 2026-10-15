// 백엔드 호출 공통 도구. 화면에서 직접 import 하지 않고 src/api/*.js 안에서만 쓴다.

// 화면에 그대로 보여줄 수 있는 한국어 message 를 담은 에러
export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const REQUEST_TIMEOUT_MS = 10_000

// 개발 서버에서는 로컬 백엔드(python3 app.py)를 기본값으로 쓴다.
// 배포 빌드는 VITE_API_BASE_URL 을 꼭 지정해야 한다. (없으면 요청 전에 설정 오류로 알린다)
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')
).replace(/\/+$/, '')

// 서버가 내려준 error 문장은 입력 누락 안내('필수 항목을 입력하세요: ...')만 그대로 보여준다.
// 그 밖의 문장은 서버 내부 사정일 수 있어 상태 코드별 고정 문구로 바꾼다.
function messageForStatus(status, serverMessage, fallback) {
  if (status === 422) {
    return typeof serverMessage === 'string' && serverMessage.startsWith('필수 항목을 입력하세요:')
      ? serverMessage
      : '입력값을 확인해 주세요. 숫자 범위나 선택 항목이 올바르지 않아요.'
  }
  return fallback
}

/**
 * JSON POST. 성공하면 파싱한 본문을 돌려주고, 실패하면 ApiError 를 던진다.
 * @param {string} path 예: '/api/eligibility'
 * @param {object} body 요청 JSON
 * @param {string} unavailableMessage 서버에 닿지 못했을 때 보여줄 문구
 * @returns {Promise<any>}
 * @throws {ApiError}
 */
export async function postJson(path, body, unavailableMessage) {
  if (!API_BASE_URL) {
    throw new ApiError('API 서버 주소가 설정되지 않았어요. 관리자에게 문의해 주세요.', 'API_NOT_CONFIGURED')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    // 네트워크 끊김·CORS 차단·시간 초과는 모두 '서버에 닿지 못함'으로 본다
    throw new ApiError(unavailableMessage, 'NETWORK')
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // 본문이 JSON 이 아니면 아래에서 상태 코드로 처리한다
  }

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status, data?.error, unavailableMessage), `HTTP_${response.status}`)
  }
  if (data === null || typeof data !== 'object') {
    throw new ApiError(unavailableMessage, 'BAD_RESPONSE')
  }
  return data
}
