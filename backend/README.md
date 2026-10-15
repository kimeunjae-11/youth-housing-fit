# 청년주거핏 백엔드

팀 저장소 루트의 `backend/`, `data/`, `docs/` 구조를 전제로 합니다. frontend/design 파일은 포함하거나 수정하지 않았습니다.

## 실행

Python 3.11 이상에서 저장소 루트 기준:

```sh
cd backend
python3 app.py
```

브라우저에서 `http://127.0.0.1:8000/health`를 확인하세요. 종료는 Ctrl+C입니다. 로컬 실행에는 추가 설치가 필요 없습니다. `.env.example`은 설정 참고 파일이며 자동으로 읽지 않습니다. CORS_ORIGINS, PORT는 실행 환경의 환경변수로 설정하세요.

## 테스트

backend 폴더에서:

```sh
python3 -m unittest discover -s tests -v
```

데이터 조회·자격 판정·추천 필터·입력 검증·HTTP 응답·CORS를 검증합니다. 가상 공고는 테스트 코드 안에만 있으며 서비스 데이터에는 섞이지 않습니다.

## 코드

- app.py: HTTP API 및 CORS, 입력 본문 최대 16KB
- service.py: 자격 판정·필터. 개인정보를 저장하거나 로그에 남기지 않음
- prepare_data.py: 원본 JSON에서 행복주택 서비스 항목 추출
- import_excel.py: 엑셀 재변환(이 경우 requirements-import.txt 설치 필요)
- ../data/eligibility-rules.json: 기준값·근거·기준일
- ../data/housing.json: LH 행복주택 5개 + GH 오산가장 1개 참고 데이터
- ../data/osan-source.json: 원본 시트 값 및 해시

## 현재 데이터의 제한

현재 확인된 행복주택 공고는 모두 접수 마감입니다. 시연용 탐색 API는 지역·월세에 맞는 과거 공고도 반환하고 접수 마감·참고용 상태를 표시합니다. 자격 판정과 독립적인 주택 탐색이며, 신청 가능한 공고 추천이 아닙니다. 실제 모집상태나 금액을 바꾸지 않았습니다.

GH 오산가장 기준은 엑셀에 근거가 있지만 일부 예외·증빙 규칙은 미구현입니다. 따라서 rules_complete=false이며 전체 자격은 needs_review 또는 not_met입니다. LH 5개 공고는 자격·임대료 기준일 연결이 미확정이므로 GH 규칙을 복사하지 않았습니다.

행복주택 요약 임대료는 최소형·소득 없는 청년 기준입니다. 소득 있는 청년과 다른 형에 그대로 사용하면 안 됩니다. 추천에 연결하려면 해당 공고·계층·형의 확정 가격으로 데이터 레코드를 나누어야 합니다. 동 이름·면적은 원문 검증이 필요해 null로 남겼습니다. null을 임의의 동·면적으로 바꾸지 마세요.

rules_complete를 true로 바꾸는 것만으로 검증이 완료되는 것은 아닙니다. 공고별 전체 기준 확인 후 해당 규칙을 별도 ID로 추가하고 listing.rule_id에 연결해야 합니다.

## 배포 준비

저장소 루트에서 Dockerfile을 지정해 빌드합니다:

```sh
docker build -f backend/Dockerfile -t youth-housing-backend .
docker run --rm -p 8000:8000 youth-housing-backend
```

호스팅은 이 Dockerfile 또는 backend 폴더에서 `gunicorn --bind 0.0.0.0:$PORT app:application`으로 실행할 수 있습니다. 후자는 backend/requirements.txt 설치가 필요합니다. HTTPS 백엔드 주소를 프론트 환경변수에 지정하세요. 호스팅 자체의 로그·요청 제한 설정도 별도로 확인해야 합니다.

Docker 빌드·실제 호스팅·프론트 연결은 아직 검증하지 않았습니다. 이것은 공개 배포 완료본이 아닌 검토·통합용 파일입니다.

## 시연용 변경 사항

자격 응답은 기존 status(전체 사전판정)를 유지하고 basic_status(실제로 검사한 항목의 충족 여부), assessed_count, unknown_count, additional_review를 추가했습니다. basic_status=met도 입력하지 않은 항목이나 예외가 있으면 최종 신청자격 충족을 의미하지 않습니다. 화면에는 반드시 basic_message와 검사 수, 추가 확인 항목을 함께 보여주세요.

추천 API의 결과는 지역·월세 탐색으로 변경했습니다. 미충족·미확정 판정이어도 탐색 목록은 반환하며 공고별 eligibility_status=not_evaluated를 제공합니다. match_reasons와 status_label을 카드에 표시하세요. LH 목록을 GH 기준 통과 주택으로 표시하면 안 됩니다.

실행 가능한 요청·응답 예시는 docs/demo-request.json과 docs/demo-response.json을 참고하세요. 원문 기준 검증·프론트 연동·공개 배포는 여전히 남아 있습니다.

## 필수 입력 및 임대료 적용 방식 업데이트

- 필수: age, monthly_income, total_assets, homeless, housing_subscription, marital_status, region. 누락·null·빈 문자열은 HTTP 422입니다. 0과 false는 유효합니다. income_scope=household이면 household_size도 필수입니다. 월세 상한과 추가 심사 항목은 선택이며 미확인 심사는 unknown으로 남습니다.
- 임대료 원본 monthly_rent와 deposit은 요약 참고 가격으로 보존합니다. 이 값을 사용자에게 적용되는 확정 가격처럼 표시하지 마세요.
- rent_verified=true이며 rent_income_group이 사용자와 맞는 레코드만 월세 필터에 사용합니다. group은 all/income/no_income이며 income/no_income은 income_scope=self의 본인 소득으로만 구분합니다. rent_verified는 공고·주택형·대상과 근거를 확인한 뒤에만 설정해야 합니다.
- 적용 가능한 금액은 applicable_monthly_rent입니다. 미확인 시 null, rent_needs_review=true, budget_status=unknown이며 목록에서 제외하지 않습니다. 이 경우 예산 안에 든다는 뜻이 아닙니다. 원본 가격이 예산을 넘더라도 사용자 적용 가격이 미확인이면 제외하지 않습니다.
- budget_status는 within_budget / not_requested / unknown입니다. price_label을 가격 옆에 표시하고 unknown에는 ‘적용 임대료·예산 충족 미확인’을 표시하세요. 금액 정렬도 확인된 적용 가격을 먼저 사용합니다.
- 현재 수집 데이터 6개는 모두 rent_verified=false입니다. 따라서 모두 임대료 추가 확인 대상으로 남으며 월세 상한에 따른 확정 제외는 하지 않습니다. 마감 포함 참고 탐색은 유지합니다.
