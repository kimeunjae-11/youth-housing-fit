# 백엔드 API 약속

## 7개 정책 1차 추천 API

`POST /api/policy-recommendations`는 정책 후보 하나를 반환합니다. 기존 `/api/recommendations`는 주택 공고 목록을 탐색합니다. 브라우저 테스트 화면은 같은 서버의 `GET /demo`로 접속합니다. HEAD /demo도 지원합니다.

```json
{
  "age_years": 23,
  "married": false,
  "applicant_owns_home": false,
  "housing_goal": "rent",
  "rental_preference": "existing_public_home"
}
```

개별 필드는 선택 입력이며 생략·null은 미확인으로 처리합니다. 해당 경로의 본인 또는 세대 무주택 여부가 확인되어야 후보에 포함됩니다. 빈 객체는 status=no_recommendation, recommendation=null을 반환합니다. 금액은 원 단위 정수입니다.

| 입력 필드 | 타입 | 의미 |
| --- | --- | --- |
| age_years | integer | 공고일 만 나이, 0 이상 |
| married | boolean | 혼인 여부 |
| applicant_owns_home / household_owns_home | boolean | 본인 / 세대 현재 주택 소유 |
| applicant_ever_owned_home / household_ever_owned_home | boolean | 본인 / 세대 과거 소유 이력 |
| household_head | boolean | 세대주 여부 |
| is_student / is_job_seeker | boolean | 공고상 대학생 / 취업준비생 자격 |
| early_career_status / paid_work_years | boolean / integer | 사회초년생 활동 요건 / 소득 업무 종사 연수 |
| care_leaver / youth_shelter_leaver | boolean | 통합공공임대 대체 경로 관련 자격 |
| applicant_monthly_income_krw / parents_monthly_income_krw / household_monthly_income_krw | integer | 본인 / 부모 합계 / 세대 월소득 |
| household_size / applicant_and_parents_size / parents_size | integer | 각 소득 심사 범위의 인원수, 1 이상 |
| has_subscription | boolean | 청약통장 보유 |
| subscription_months / subscription_payment_count | integer | 가입 개월 / 인정 납입 횟수 |
| private_subscription_first_rank | boolean | 해당 민영주택 공고의 청약 1순위 |
| income_tax_years | integer | 인정 납세 연수 |
| has_child / first_time_area_limit_applies | boolean | 자녀 여부 / 1인 생애최초 면적 제한 적용 |
| preferred_exclusive_area_m2 | integer | 전용면적 |
| owns_vehicle / vehicle_value_krw | boolean / integer | 소유 여부 / 가액. 현재 가액 상한 비교는 미구현 |
| welfare_qualifications | string[] | 복지 자격 코드 배열 |

`housing_goal`은 `any`(또는 생략), `rent`, `purchase`, `rent_then_optional_purchase`입니다. 선택형은 마지막 경로, purchase는 민간분양 생애최초 경로를 검토합니다.

`rental_preference`는 `public_complex`(행복주택·통합공공임대), `find_jeonse`(전세임대), `existing_public_home`(매입임대), `private_rental`(공공지원민간임대)이며 생략할 수 있습니다.

복지 코드는 `benefit_household`, `supported_single_parent`, `near_poverty`, `care_leaver`, `youth_shelter_leaver`입니다. 퇴소 자격 배열 코드는 전세임대 1순위, 별도 boolean은 통합공공임대 대체 경로에 사용합니다.

### 정책 추천 응답

- `status`는 `needs_info`, `potential_match`, `no_recommendation` 중 하나입니다.
- `recommendation`은 정책 객체 하나 또는 null입니다.
- 정책 객체에 `policy_id`, `name`, `supply_type`, `route`, `track_id`, `priority`, `summary`, `reasons`, `to_verify`, `notice_checks`, `sources`를 포함합니다.
- `reasons`는 추천 근거, `to_verify`는 평가 중 미확인 조건, `notice_checks`는 공고별 확인 항목입니다. sources 원소는 name과 url입니다.
- `message`는 안내입니다. 추천 후보에도 실제 공고 확인 안내를 표시하세요.

불충족 경로를 제외한 뒤 신청 경로 확인, 임대 선호, 1순위 복지, 소득 충족, 충족 조건 수, 적은 미확인 수, 정책 JSON 순서, 순위 번호 순으로 비교합니다. 공식 당첨 순위는 해당 공고로 확인합니다.

`POLICY_INCOME_TABLE_FILE`로 공고 기준표를 연결합니다. 미설정 시 소득은 미확인입니다. 실제 공고별 지역·자산·차량 상한은 현재 확인 항목으로 안내합니다. 실행 설정은 backend/README.md를 참고하세요.

팀 서버 공통 오류 규칙을 적용합니다. 입력·JSON 오류는 422, Content-Type은 415, 본문 크기는 413, 경로는 404, 메서드는 405입니다. 요청 상한은 16KB입니다. 예전 독립 서버의 `/recommend`를 호출하던 코드는 새 주소와 상태코드로 변경해야 합니다.

## 기존 행복주택 API

프론트 코드를 아직 전달받지 않아 다음 형식은 제안 계약입니다. 담당자와 확인 후 맞춰야 합니다.

## 경로

|메서드|경로|역할|
|---|---|---|
|GET|/health|실행 상태와 데이터 기준일|
|GET|/api/housing|참고용 수집 데이터. 추천·자격충족 목록이 아님|
|POST|/api/eligibility|GH 오산가장 청년 기준 사전판정|
|POST|/api/recommendations|자격과 별개인 지역·월세 참고용 탐색(마감 포함)|

요청 Content-Type은 application/json입니다. 금액은 **원**, 나이는 **공고일 기준 만 나이**입니다. 누락값은 충족으로 간주하지 않습니다. 개인정보 식별정보(이름·연락처·주민번호)는 받지 않습니다.

```json
{
  "age": 26,
  "monthly_income": 2500000,
  "total_assets": 50000000,
  "homeless": true,
  "housing_subscription": true,
  "region": "오산시 전체",
  "max_monthly_rent": 200000,
  "marital_status": "single",
  "income_scope": "self",
  "household_size": 1,
  "children_after_20230328": 0,
  "car_value": 0
}
```

income_scope=self는 본인 심사, household는 세대 심사입니다. 공고에서 심사 대상을 확인하고 입력해야 합니다. 순자산은 부채 차감 후 금액입니다. car_value는 자동차 가액입니다. region은 오산시/오산시 전체/정확한 동 이름입니다. 현재 데이터는 동 미확정이라 동 필터 결과가 없을 수 있습니다.

현재 MVP 기획의 5개 입력만 전달하면 혼인·차량·소득 심사 범위 등은 unknown입니다. 전체 자격을 확정할 수 없으므로 화면에서 needs_review를 ‘신청 가능’으로 표시하지 마세요.

## 판정 응답

- status: met / not_met / needs_review (기존 전체 사전판정)
- basic_status, basic_message: 검사한 항목만의 기본조건 결과
- assessed_count, unknown_count: 검사한 항목 수와 미확인 항목 수
- additional_review: 미확인 항목과 미구현 예외 목록
- checks: field, label, input_value, criterion, status, reason, excess_amount
- rule_id, basis_date, source_url, source_note, rules_complete, scope

각 항목 status는 met / not_met / unknown입니다. 청약통장은 현재 미가입만으로 탈락시키지 않으며 입주 전 가입 여부를 추가 확인합니다. 나이 범위 밖은 사회초년생 예외 확인이 필요합니다.

## 추천 응답

- eligibility: 위 판정 결과
- results, total: 추천 공고와 개수
- data_as_of: 데이터 정리 기준일
- evaluated_at: 한국 시간 기준 판정 날짜
- message: 결과 설명

시연용 목록은 자격 판정과 별개로 지역·월세에 맞는 주택을 반환합니다. 마감 공고도 포함하며 recruitment_status와 status_label을 표시해야 합니다. 항목별 eligibility_status=not_evaluated이므로 신청자격 충족 목록으로 표시하면 안 됩니다. 사용자 적용 임대료가 미확인인 공고는 월세 필터에서 제외하지 않고 rent_needs_review=true로 표시합니다. match_reasons는 탐색 이유이고 cautions는 표시해야 하는 적용 대상·자격 안내입니다.

basic_status=met는 검사한 항목에 미충족이 없다는 뜻입니다. 추가 심사 항목이 미확인일 수 있으므로 assessed_count, unknown_count, additional_review를 함께 보여주세요. unknown을 충족으로 바꾸지 않습니다. GH 기준 진단과 LH 주택 탐색은 서로 다른 범위입니다.

## 오류

422: 입력값 오류 / 415: Content-Type 오류 / 413: 본문 크기 오류 / 404: 경로 없음 / 405: 메서드 오류. CORS는 현재 Vercel 주소, localhost 5173/3000을 기본 허용합니다.

```javascript
const response = await fetch(`${API_BASE_URL}/api/eligibility`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(profile),
});
const result = await response.json();
if (!response.ok) throw new Error(result.error);
```

## 필수 입력 및 임대료 적용 방식 업데이트

- 필수: age, monthly_income, total_assets, homeless, housing_subscription, marital_status, region. 누락·null·빈 문자열은 HTTP 422입니다. 0과 false는 유효합니다. income_scope=household이면 household_size도 필수입니다. 월세 상한과 추가 심사 항목은 선택이며 미확인 심사는 unknown으로 남습니다.
- 임대료 원본 monthly_rent와 deposit은 요약 참고 가격으로 보존합니다. 이 값을 사용자에게 적용되는 확정 가격처럼 표시하지 마세요.
- rent_verified=true이며 rent_income_group이 사용자와 맞는 레코드만 월세 필터에 사용합니다. group은 all/income/no_income이며 income/no_income은 income_scope=self의 본인 소득으로만 구분합니다. rent_verified는 공고·주택형·대상과 근거를 확인한 뒤에만 설정해야 합니다.
- 적용 가능한 금액은 applicable_monthly_rent입니다. 미확인 시 null, rent_needs_review=true, budget_status=unknown이며 목록에서 제외하지 않습니다. 이 경우 예산 안에 든다는 뜻이 아닙니다. 원본 가격이 예산을 넘더라도 사용자 적용 가격이 미확인이면 제외하지 않습니다.
- budget_status는 within_budget / not_requested / unknown입니다. price_label을 가격 옆에 표시하고 unknown에는 ‘적용 임대료·예산 충족 미확인’을 표시하세요. 금액 정렬도 확인된 적용 가격을 먼저 사용합니다.
- 현재 수집 데이터 6개는 모두 rent_verified=false입니다. 따라서 모두 임대료 추가 확인 대상으로 남으며 월세 상한에 따른 확정 제외는 하지 않습니다. 마감 포함 참고 탐색은 유지합니다.
