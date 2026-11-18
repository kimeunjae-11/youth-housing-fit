"""청년주거핏 1차 정책 추천 API. Python 표준 라이브러리만 사용한다."""
import json
from dataclasses import dataclass, field
from pathlib import Path


CATALOG = json.loads(
    (Path(__file__).resolve().parent.parent / "data" / "youth_housing_policies.json").read_text(encoding="utf-8")
)
ROUTES = {
    "rent": "임대", "purchase": "분양", "rent_then_optional_purchase": "임대 후 분양 선택",
}
RENT_PREFERENCES = {
    "public_complex": {"happy_housing", "integrated_public_rental"},
    "find_jeonse": {"youth_jeonse_rental"},
    "existing_public_home": {"youth_purchase_rental"},
    "private_rental": {"public_supported_private_rental"},
}
PRIORITY_ONE_COMMON = ("benefit_household", "supported_single_parent", "near_poverty")
BOOLEAN_FIELDS = (
    "married", "applicant_owns_home", "household_owns_home", "applicant_ever_owned_home",
    "household_ever_owned_home", "household_head", "is_student", "is_job_seeker",
    "early_career_status", "care_leaver", "youth_shelter_leaver", "owns_vehicle",
    "has_subscription", "private_subscription_first_rank", "has_child",
    "first_time_area_limit_applies",
)
INTEGER_FIELDS = (
    "age_years", "household_size", "applicant_and_parents_size", "parents_size",
    "applicant_monthly_income_krw", "parents_monthly_income_krw",
    "household_monthly_income_krw", "subscription_months", "subscription_payment_count",
    "income_tax_years", "paid_work_years", "vehicle_value_krw",
    "preferred_exclusive_area_m2",
)


@dataclass
class Assessment:
    passed: list = field(default_factory=list)
    missing: list = field(default_factory=list)
    failed: list = field(default_factory=list)

    def check(self, result, label):
        destination = self.missing if result is None else self.passed if result else self.failed
        if label not in destination:
            destination.append(label)


def validate(payload):
    if not isinstance(payload, dict):
        raise ValueError("입력은 JSON 객체여야 합니다.")
    for key in BOOLEAN_FIELDS:
        if payload.get(key) is not None and type(payload[key]) is not bool:
            raise ValueError(f"{key}는 true 또는 false여야 합니다.")
    for key in INTEGER_FIELDS:
        value = payload.get(key)
        minimum = 1 if key.endswith("_size") else 0
        if value is not None and (type(value) is not int or value < minimum):
            raise ValueError(f"{key}는 {minimum} 이상의 정수여야 합니다.")
    for key, options in (
        ("housing_goal", (*ROUTES, "any")),
        ("rental_preference", RENT_PREFERENCES),
    ):
        value = payload.get(key)
        if value is not None and (not isinstance(value, str) or value not in options):
            raise ValueError(f"{key} 값은 {', '.join(options)} 중 하나여야 합니다.")
    welfare = payload.get("welfare_qualifications")
    allowed_welfare = (*PRIORITY_ONE_COMMON, "care_leaver", "youth_shelter_leaver")
    if welfare is not None and (
        not isinstance(welfare, list) or
        any(not isinstance(item, str) or item not in allowed_welfare for item in welfare)
    ):
        raise ValueError("welfare_qualifications에 지원하지 않는 자격 코드가 있습니다.")
    if payload.get("has_subscription") is False and any(
        payload.get(key, 0) for key in ("subscription_months", "subscription_payment_count",
                                       "private_subscription_first_rank")
    ):
        raise ValueError("청약통장 보유 여부와 가입 정보가 일치해야 합니다.")
    for key in ("household_owns_home", "applicant_owns_home"):
        if payload.get(key) is True and payload.get(
            key.replace("_owns_home", "_ever_owned_home")
        ) is False:
            raise ValueError("현재 주택 소유 여부와 과거 소유 이력을 확인해 주세요.")


def any_known(*conditions):
    if True in conditions:
        return True
    return None if None in conditions else False


def in_age_range(age, limits):
    return None if age is None else limits["min"] <= age <= limits["max"]


def income_input(profile, scope):
    applicant = profile.get("applicant_monthly_income_krw")
    parents = profile.get("parents_monthly_income_krw")
    household = (profile.get("household_monthly_income_krw"), profile.get("household_size"))
    if scope == "household":
        return household
    if scope == "parents_only":
        return parents, profile.get("parents_size")
    if scope == "applicant_and_parents":
        combined = None if applicant is None or parents is None else applicant + parents
        return combined, profile.get("applicant_and_parents_size")
    if scope.startswith("household_if_"):
        household_head = profile.get("household_head")
        if household_head is None:
            return None, None
        if household_head:
            return household
    return applicant, 1


def check_income(result, rule, profile, income_tables):
    amount, size = income_input(profile, rule["scope"])
    baseline = income_tables.get(rule["benchmark"], {}).get(str(size))
    label = "소득 기준"
    if amount is None or baseline is None:
        result.check(None, label)
        return
    limit = rule.get("max_percent_by_household_size", {}).get(str(size), rule["max_percent"])
    within_limit = amount * 100 <= baseline * limit
    if not within_limit and rule.get("above_threshold_path"):
        result.check(None, "소득 상한 초과 시 적용되는 부동산가액 추첨 요건")
    else:
        result.check(within_limit, label)


def assess(policy, track, tier, profile, income_tables):
    result = Assessment()
    policy_id = policy["policy_id"]
    track_id = track["track_id"]
    ownership = profile.get(track["housing_ownership_scope"] + "_owns_home")
    result.check(None if ownership is None else not ownership, "무주택")
    if "married" in track:
        result.check(
            None if profile.get("married") is None else profile["married"] == track["married"],
            "혼인 여부",
        )

    age = in_age_range(profile.get("age_years"), track["age"]) if track.get("age") else None
    student = any_known(profile.get("is_student"), profile.get("is_job_seeker"))
    if track_id == "college_student":
        result.check(student, "대학생·취업준비생 요건")
        if profile.get("owns_vehicle") is not False:
            result.check(None, "대학생 계층 자동차 미소유 요건 및 예외")
    elif track_id == "early_career":
        years = profile.get("paid_work_years")
        result.check(None if years is None else years <= track["paid_work_years_max"],
                     "소득 있는 업무 종사 기간")
        result.check(profile.get("early_career_status"), "사회초년생 활동 요건")
    elif track.get("age_applies_to"):
        alternatives = (
            any_known(profile.get("care_leaver"), profile.get("youth_shelter_leaver"))
            if track_id == "youth_priority" else student
        )
        result.check(any_known(age, alternatives), "연령 또는 대체 신청 요건")
    elif track.get("age"):
        result.check(age, "연령")

    inherited = policy["tracks"][0] if track.get("inherits_income_assets_subscription_from") else track
    rule = (tier or inherited).get("income")
    if inherited.get("income_options"):
        applicant_income = profile.get("applicant_monthly_income_krw")
        if applicant_income is None:
            result.check(None, "본인 소득 유무에 따른 소득 심사 범위")
        else:
            rule = inherited["income_options"][0 if applicant_income > 0 else 1]
    if rule:
        check_income(result, rule, profile, income_tables)
    if (tier or inherited).get("assets"):
        result.check(None, "공고별 자산·차량 요건")

    if tier and tier["priority"] == 1:
        accepted = PRIORITY_ONE_COMMON
        if policy_id == "youth_jeonse_rental":
            accepted += ("care_leaver", "youth_shelter_leaver")
        reported = profile.get("welfare_qualifications")
        result.check(None if reported is None else bool(set(accepted) & set(reported)),
                     "1순위 복지 자격")

    if "applicant_prior_home_ownership" in track:
        history = profile.get("applicant_ever_owned_home")
        result.check(None if history is None else not history, "본인 주택 소유 이력")
    if "household_prior_home_ownership" in track:
        history = profile.get("household_ever_owned_home")
        result.check(True if history is False else None, "세대 주택 소유 이력 및 법령상 특례")
    subscription = inherited.get("subscription", {})
    for limit_key, input_key, label in (
        ("min_months", "subscription_months", "청약통장 가입 기간"),
        ("min_recognized_payments", "subscription_payment_count", "청약통장 인정 납입 횟수"),
    ):
        if limit_key in subscription:
            value = 0 if profile.get("has_subscription") is False else profile.get(input_key)
            result.check(None if value is None else value >= subscription[limit_key], label)
    if subscription.get("timing"):
        result.check(None, "입주 전 청약통장 증명 시점")
    if subscription.get("required_grade"):
        first_rank = profile.get("private_subscription_first_rank")
        result.check(False if profile.get("has_subscription") is False else first_rank,
                     "민영주택 청약 1순위")
    if track.get("tax"):
        years = profile.get("income_tax_years")
        result.check(None if years is None else years >= track["tax"]["min_qualifying_years"],
                     "소득세 납부 연수")
        result.check(None, "공고일 근로·사업 상태 또는 최근 소득세 납부 요건")
    if track.get("single_person_path"):
        family = any_known(profile.get("married"), profile.get("has_child"))
        area_limit = profile.get("first_time_area_limit_applies")
        if family is not True and area_limit is not False:
            area = profile.get("preferred_exclusive_area_m2")
            maximum = track["single_person_path"]["max_exclusive_area_m2_for_single_head_or_nonmember_on_register"]
            result.check(
                False if family is False and area_limit is True and area is not None
                and area > maximum else None,
                "1인 추첨 경로 및 전용면적 제한",
            )
    return result


def recommend(profile, income_tables=None):
    validate(profile)
    income_tables = income_tables or {}
    goal = profile.get("housing_goal")
    preferred = RENT_PREFERENCES.get(profile.get("rental_preference"), set())
    candidates = []
    for index, policy in enumerate(CATALOG["policies"]):
        route = policy["recommendation_route"]
        if goal not in (None, "any", route):
            continue
        for track in policy["tracks"]:
            for tier in track.get("priority_tiers", [None]):
                result = assess(policy, track, tier, profile, income_tables)
                if result.failed or "무주택" not in result.passed:
                    continue
                known_path = int(
                    track["track_id"] in ("general", "first_time_special") or
                    any(label in result.passed for label in (
                        "연령", "연령 또는 대체 신청 요건", "대학생·취업준비생 요건",
                        "사회초년생 활동 요건",
                    ))
                )
                welfare_match = int("1순위 복지 자격" in result.passed)
                income_match = int("소득 기준" in result.passed)
                basic_checks = len(result.passed)
                key = (
                    known_path, int(policy["policy_id"] in preferred),
                    welfare_match, income_match, basic_checks, -len(result.missing),
                    -index, -(tier["priority"] if tier else 0),
                )
                candidates.append((key, policy, track, tier, result))

    if not candidates:
        return {
            "status": "no_recommendation", "recommendation": None,
            "message": "입력으로 추천 후보를 찾지 못했어요. 무주택 정보와 선택한 주거 목적의 요건을 확인해 주세요.",
        }
    _, policy, track, tier, result = max(candidates, key=lambda item: item[0])
    reasons = [f"입력과 맞는 항목: {', '.join(result.passed)}"]
    if goal not in (None, "any"):
        reasons.append(f"희망 주거 목적: {ROUTES[goal]}")
    if policy["policy_id"] in preferred:
        reasons.append("선호하는 임대 방식에 해당해요.")
    return {
        "status": "needs_info" if result.missing else "potential_match",
        "recommendation": {
            "policy_id": policy["policy_id"], "name": policy["name"],
            "supply_type": policy["supply_type"], "route": policy["recommendation_route"],
            "track_id": track["track_id"], "priority": tier["priority"] if tier else None,
            "summary": policy["summary"], "reasons": reasons, "to_verify": result.missing,
            "notice_checks": policy["notice_fields"],
            "sources": [CATALOG["sources"][key] for key in policy["source_ids"]],
        },
        "message": "정책 후보 1개를 추천했어요. 실제 신청 자격은 모집공고에서 확인해 주세요.",
    }


def load_income_tables(path=None):
    """공고 기준소득표를 읽는다. 미설정 시 소득 조건을 미확인으로 평가한다."""
    if not path:
        return {}
    tables = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(tables, dict) or any(
        not isinstance(table, dict) or any(
            not size.isdigit() or int(size) < 1 or type(amount) is not int or amount <= 0
            for size, amount in table.items()
        )
        for table in tables.values()
    ):
        raise ValueError("소득표는 기준명 → 가구원 수 → 양의 정수 월액 형태여야 합니다.")
    return tables
