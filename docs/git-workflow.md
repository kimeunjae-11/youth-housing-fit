# Git 작업 규칙

## 1. 브랜치 규칙

- `main`에는 **직접 push하지 않습니다.** 모든 변경은 **PR(Pull Request)로만 병합**합니다.
- 작업 브랜치 이름은 `접두사/작업-내용` 형식으로 만듭니다.
  - 예: `feat/policy-search`, `fix/login-error`, `data/lh-crawling`, `docs/init-structure`, `design/main-wireframe`
- PR은 최소 1명 이상의 팀원 리뷰(Approve)를 받은 뒤 병합합니다.
- 병합된 브랜치는 삭제합니다.

## 2. 커밋 메시지 접두사

| 접두사 | 용도 | 예시 |
| --- | --- | --- |
| `feat` | 새로운 기능 추가 | `feat: 정책 검색 API 추가` |
| `fix` | 버그 수정 | `fix: 나이 필터 조건 오류 수정` |
| `data` | 데이터 수집·전처리·데이터셋 변경 | `data: 공공임대 공고 데이터 전처리` |
| `docs` | 문서 작성·수정 | `docs: README 폴더 구조 추가` |
| `design` | 화면 설계·디자인 산출물 | `design: 메인 화면 와이어프레임 추가` |

형식: `접두사: 변경 내용 요약` (한 커밋에는 하나의 목적만 담습니다.)

## 3. 작업 순서

1. **최신 main 받기**
   ```bash
   git switch main
   git pull origin main
   ```
2. **작업 브랜치 생성**
   ```bash
   git switch -c feat/작업-내용
   ```
3. **작업 후 커밋**
   ```bash
   git add .
   git commit -m "feat: 변경 내용 요약"
   ```
4. **원격에 푸시**
   ```bash
   git push -u origin feat/작업-내용
   ```
5. **GitHub에서 PR 생성** — PR 템플릿을 채우고 리뷰어를 지정합니다.
6. **리뷰 반영 후 병합** — Approve를 받으면 main으로 병합하고 브랜치를 삭제합니다.
7. **로컬 정리**
   ```bash
   git switch main
   git pull origin main
   git branch -d feat/작업-내용
   ```

## 4. 주의사항

- `.env` 등 비밀 정보(API 키, 비밀번호)는 절대 커밋하지 않습니다. 필요한 경우 `.env.example`을 공유합니다.
- 대용량 원본 데이터는 저장소에 올리지 않고, 출처와 다운로드 방법을 문서로 남깁니다.
- 충돌이 나면 혼자 해결하기 어려운 경우 팀 채널에 공유합니다.
