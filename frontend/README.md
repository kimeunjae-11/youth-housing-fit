# frontend

React + Vite(JavaScript) + Tailwind CSS v3 기반 웹 프론트엔드입니다.

```bash
cd frontend && npm install   # 최초 1회: 의존성 설치 (Node.js 20.19+ 또는 22.12+)
npm run dev                  # 개발 서버 실행 (http://localhost:5173)
npm run build                # 프로덕션 빌드 (dist/)
```

`npm run preview`(빌드 결과 미리보기), `npm run lint`(코드 검사)도 같은 폴더에서 실행합니다.

## 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 조건 입력 |
| `/result` | 자격 판정 결과 |
| `/recommend` | 맞춤 추천 |

`/result`, `/recommend`는 조건 입력을 거쳐 넘어온 값(router state)으로 동작합니다. 주소창에 직접 입력해 들어오면 `/`로 이동합니다.

## 목업 API

백엔드가 연동되기 전까지 `src/api/`의 함수가 목업 응답을 돌려줍니다. 화면은 이 함수만 import합니다.

- `checkEligibility(condition)` — 자격 판정 (`src/api/eligibility.js`)
- `fetchRecommendations(condition)` — 맞춤 추천 공고 (`src/api/recommendations.js`)

판정 기준값과 공고 데이터는 임시 값입니다. 각 파일 상단의 `[임시]` 주석을 확인하세요.

### 상태 확인용 입력값

| 확인할 상태 | 입력 | 결과 |
| --- | --- | --- |
| 자격 판정 에러 | 총자산 `9999` | `/result`에 에러 화면 |
| 추천 에러 | 월 임대료 상한 `9999` | `/recommend`에 에러 화면 |
| 추천 0건 | 월 임대료 상한 `1` | `/recommend`에 빈 결과 화면 |
| 자격 미충족 | 월 소득 `300`, 또는 "주택 보유" 선택 | `/result`에서 미충족 안내 |

API 연동 시 위 트리거 값은 제거합니다.
