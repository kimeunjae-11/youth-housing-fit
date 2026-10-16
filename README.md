# youth-housing-fit

캡스톤 디자인1 (팀 온기)

## 프로젝트 소개

**청년주거 핏**은 청년이 공공임대주택 모집공고의 신청 자격을 쉽게 확인하도록 돕는 서비스입니다.
조건을 입력하면 공고 기준과 항목별로 비교해 충족·미충족·추가 확인 필요를 판정 근거와 함께 보여주고, 지역·월세에 맞는 참고용 주택 목록을 제공합니다.

현재 MVP는 **오산시 행복주택**(LH 5건 + GH 1건 공고, GH 오산가장 청년 기준)을 대상으로 합니다. 판정 결과는 참고용이며 최종 자격은 공고문과 공급기관 심사로 결정됩니다.

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

## 실행 방법 (로컬)

터미널 두 개를 엽니다. 시연 순서와 자주 나는 오류는 [docs/demo-guide.md](docs/demo-guide.md)를 참고하세요.

### 1. 백엔드 (`backend/`, Python 3.11 이상)

```bash
cd backend
py -m pip install tzdata   # Windows 최초 1회 (macOS·Linux는 생략 가능)
py app.py                  # Windows. macOS·Linux는 python3 app.py
```

`http://127.0.0.1:8000/health`에서 `{"status": "ok", ...}`가 보이면 정상입니다. API 형식은 [docs/backend-api.md](docs/backend-api.md), 테스트는 [backend/README.md](backend/README.md)를 참고하세요.

### 2. 프론트엔드 (`frontend/`, Node.js 20.19 이상 또는 22.12 이상)

```bash
cd frontend
npm install        # 최초 1회
npm run dev        # http://localhost:5173
```

개발 서버는 `http://127.0.0.1:8000` 백엔드에 자동으로 연결됩니다. 다른 주소를 쓰려면 `frontend/.env.example`을 참고하세요. 자세한 내용은 [frontend/README.md](frontend/README.md)에 있습니다.

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
