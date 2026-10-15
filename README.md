# youth-housing-fit

캡스톤 디자인1 (팀 온기)

## 프로젝트 소개

**youth-housing-fit**은 청년이 자신의 조건(소득, 나이, 거주지, 가구 형태 등)에 맞는 주거 지원 정책과 주택을 쉽게 찾을 수 있도록 돕는 서비스입니다.
흩어져 있는 청년 주거 정책·공공임대 정보를 모아, 사용자에게 적합한 선택지를 추천하는 것을 목표로 합니다.

## 폴더 구조

```
youth-housing-fit/
├── frontend/   # 웹 프론트엔드
├── backend/    # API 서버
├── data/       # 데이터 수집·전처리 스크립트 및 샘플 데이터
├── design/     # 화면 설계, 와이어프레임, 디자인 산출물
├── docs/       # 회의록, 기획 문서, 협업 규칙
└── .github/    # PR 템플릿 등 GitHub 설정
```

## 실행 방법

### 프론트엔드 (`frontend/`)

Node.js 20.19 이상(또는 22.12 이상)이 필요합니다. 아래 명령은 모두 `frontend/` 폴더 안에서 실행합니다.

```bash
cd frontend
npm install        # 최초 1회: 의존성 설치
npm run dev        # 개발 서버 실행 → http://localhost:5173
npm run build      # 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
npm run lint       # 코드 검사
```

백엔드 API가 아직 연동되지 않아 판정·추천 결과는 목업 데이터입니다. 자세한 내용은 [frontend/README.md](frontend/README.md)를 참고하세요.

## 팀원

| 이름 | 역할 | GitHub |
| --- | --- | --- |
| 김은재 | FE/UI | [@kimeunjae-11](https://github.com/kimeunjae-11) |
| 박지은 | BE/DATA | [@qlusdeirx](https://github.com/qlusdeirx) |
| 권지민 | VIDEO/DATA | [@jiminkweon](https://github.com/jiminkweon) |
| 이유빈 | FE/PPT | [@ekq5415](https://github.com/ekq5415) |

## 협업 규칙

- [Git 작업 규칙](docs/git-workflow.md)
- PR 작성 시 [PR 템플릿](.github/pull_request_template.md)이 자동으로 적용됩니다.
