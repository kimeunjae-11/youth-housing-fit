// 목업 API 공통 도구. 화면에서 직접 import 하지 않고 src/api/*.js 안에서만 쓴다.

export const MOCK_DELAY_MS = 300

export const delay = (ms = MOCK_DELAY_MS) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

// 화면에 그대로 보여줄 수 있는 한국어 message 를 담은 에러
export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}
