import { getJson } from './client.js'

/**
 * 백엔드 상태 확인. 조건 입력 화면에서 데이터 기준일을 보여주고, 서버가 꺼져 있으면 미리 알리는 데 쓴다.
 * @returns {Promise<{ dataAsOf: string }>}
 * @throws {ApiError}
 */
export async function checkHealth() {
  const data = await getJson('/health', '판정 서버에 연결하지 못했어요.')
  return { dataAsOf: data.data_as_of }
}
