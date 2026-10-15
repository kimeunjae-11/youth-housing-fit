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

## 백엔드 API 연결

화면은 `src/api/`의 함수만 import하고, 이 함수들이 백엔드를 호출합니다.

- `checkEligibility(condition)` — `POST /api/eligibility` (`src/api/eligibility.js`)
- `fetchRecommendations(condition)` — `POST /api/recommendations` (`src/api/recommendations.js`)
- `src/api/client.js` — fetch 공통 처리(주소·시간 초과·오류 문구)
- `src/api/request.js` — 폼 값 → 요청 JSON 변환 (만원 → 원, 선택 코드 → boolean·지역 이름)

### 로컬 실행

```bash
# 터미널 1: 백엔드 (Python 3.11+, 추가 설치 없음)
cd backend && python3 app.py        # http://127.0.0.1:8000

# 터미널 2: 프론트
cd frontend && npm run dev          # http://localhost:5173
```

백엔드 주소는 `VITE_API_BASE_URL`로 바꿉니다. 개발 서버에서 값이 없으면 `http://127.0.0.1:8000`을 씁니다. 배포 빌드(Vercel)는 환경변수를 지정하지 않으면 "API 서버 주소가 설정되지 않았어요" 오류가 납니다. `.env.example`을 참고하세요.

### 화면에 반영한 응답 규칙

- 자격 판정 `status`가 `needs_review`이면 "신청 가능"이 아니라 "기본 조건은 충족, 추가 확인 필요"로 보여줍니다. 항목별 `unknown`은 "확인 필요"로 표시합니다.
- 맞춤 주택 목록은 자격과 별개인 지역·월세 참고 탐색입니다. 마감 공고도 포함되며 모집 상태 배지(`status_label`)와 가격 안내(`price_label`)를 함께 보여줍니다.
- `applicable_monthly_rent`가 `null`이면 임대료는 "참고 월 ○○원"으로만 표시합니다.
- 백엔드는 혼인 상태(`marital_status`)가 필수라서 조건 입력에 "혼인 상태"를 추가했습니다.
- 소득·자산 판정에 필요한 `income_scope: self`, `household_size: 1`, `children_after_20230328: 0`은 폼에서 묻지 않고 고정값으로 보냅니다. (`src/api/request.js`)
- 동 단위 희망 지역(세교·원동·가장동)은 공고 데이터에 동 정보(district)가 채워질 때까지 "준비 중"으로 선택을 막아 두었습니다. (`src/constants/condition.js`)
- 조건 입력 화면은 `/health`를 호출해 데이터 기준일을 보여주고, 백엔드가 꺼져 있으면 미리 안내합니다.

### 상태 확인

| 확인할 상태 | 방법 | 결과 |
| --- | --- | --- |
| 서버 연결 실패 | 백엔드를 끄고 진단하기 | 연결 실패 안내와 다시 시도 버튼 |
| 기준 미충족 | 월 소득 `600` 이상 입력 | `/result`에서 미충족 항목과 초과 사유 |
| 추가 확인 필요 | 월 소득 `250`, 총 자산 `5000`, 혼인 중 아님, 무주택 | `/result`에서 기본 조건 충족 + 추가 확인 목록 |
| 예시 입력 | "예시로 체험하기" 버튼 | 폼이 예시 값으로 채워짐 |
