"""캡스톤1 맞춤 공고 랭킹의 독립 모듈.

중요: status='met'인 공고별 자격판정이 명시적으로 존재할 때만
상위 3건 추천 대상으로 사용한다. 기존 참고용 공고를 '적격'으로
변환하지 않는다. 점수/가중치는 연구일지 기반의 임시 설계안이다.
"""
from datetime import date
import math

# 상대 중요도. 합계는 1이나 100일 필요가 없으며, 비교 가능한 항목만 정규화합니다.
DEFAULT_WEIGHTS = {'region': 30, 'rent': 30, 'area': 20, 'deposit': 20, 'deadline': 0}


def _nonnegative(value):
    return type(value) in (int, float) and math.isfinite(value) and value >= 0


def _score(item, preferences, weights, today):
    """검증에 필요한 정보가 없는 항목은 점수 0 대신 None으로 처리."""
    parts = {}
    desired = preferences.get('region')
    notice_region = item.get('region')
    if desired and desired not in ('all', '오산시 전체'):
        parts['region'] = (100 if desired == notice_region else 0) if notice_region else None
    else:
        parts['region'] = None  # 사용자 선호가 없으면 비교할 수 없음

    ceiling = preferences.get('max_monthly_rent')
    rent = item.get('applicable_monthly_rent')
    if isinstance(ceiling, (int, float)) and ceiling > 0 and isinstance(rent, (int, float)) and rent >= 0:
        parts['rent'] = round(100 * max(0, 1 - rent / ceiling), 2)
    else:
        parts['rent'] = None

    # 전용면적: 희망 최소면적에 도달하면 100점, 미달하면 비율만큼 반영
    minimum_area = preferences.get('min_area_sqm')
    area = item.get('area_sqm')
    if _nonnegative(minimum_area) and minimum_area > 0 and _nonnegative(area):
        parts['area'] = round(100 * min(area / minimum_area, 1), 2)
    else:
        parts['area'] = None

    # 보증금: 희망 최대 보증금 대비 여유가 클수록 가점 (상한 초과는 0점)
    maximum_deposit = preferences.get('max_deposit')
    deposit = item.get('deposit')
    if _nonnegative(maximum_deposit) and maximum_deposit > 0 and _nonnegative(deposit):
        parts['deposit'] = round(100 * max(0, 1 - deposit / maximum_deposit), 2)
    else:
        parts['deposit'] = None

    end = item.get('application_end')
    if end:
        try:
            days = (date.fromisoformat(end) - today).days
        except ValueError:
            days = -1
        parts['deadline'] = (100 if days == 0 else round(100 * (30 - days) / 30, 2)) if 0 <= days <= 30 else (0 if days > 30 else None)
    else:
        parts['deadline'] = None

    valid = [(name, value) for name, value in parts.items() if value is not None and weights.get(name, 0) > 0]
    denominator = sum(weights[name] for name, _ in valid)
    score = round(sum(value * weights[name] for name, value in valid) / denominator, 1) if denominator else None
    reasons = []
    if parts['region'] == 100:
        reasons.append('희망 지역 일치')
    if parts['area'] == 100:
        reasons.append('희망 전용면적 충족')
    if parts['rent'] is not None and parts['rent'] > 0:
        reasons.append('월 임대료 선호조건 반영')
    if parts['deposit'] is not None and parts['deposit'] > 0:
        reasons.append('보증금 선호조건 반영')
    return score, parts, reasons


def rank_notices(notices, judgments, preferences, weights=None, today=None):
    """공고 ID 기준으로 조인. judgments={notice_id: {'status':'met'|'needs_review'|'not_met'}}.

    반환값: {'top3': [...], 'needs_review': [...], 'ineligible': [...],
             'unverified': [...]}. 단, 모집 마감/예정/미확인은 TOP 3 제외.
    """
    today = today or date.today()
    if not isinstance(notices, list) or not isinstance(judgments, dict) or not isinstance(preferences, dict):
        raise ValueError('공고 목록, 판정 결과, 희망조건의 자료형을 확인하세요')
    weights = DEFAULT_WEIGHTS if weights is None else weights
    if (not isinstance(weights, dict) or set(weights) - set(DEFAULT_WEIGHTS)
            or any(not _nonnegative(v) for v in weights.values())
            or sum(weights.values()) <= 0):
        raise ValueError('가중치는 지원하는 항목의 0 이상 숫자이며 합계가 양수여야 합니다')
    groups = {
        'eligible': [],
        'needs_review': [],
        'ineligible': [],
        'unverified': [],
        'closed': []
    }
    for item in notices:
        result = judgments.get(item['id'])
        status = result.get('status') if isinstance(result, dict) else None
        if status == 'not_met':
            group = 'ineligible'
        elif status == 'needs_review':
            group = 'needs_review'
        elif status == 'met':
            group = 'eligible'
        else:
            group = 'unverified'
        end = item.get('application_end')
        start = item.get('application_start')
        try:
            accepting = bool(start and end and date.fromisoformat(start) <= today <= date.fromisoformat(end) and item.get('notice_status') != 'closed')
        except ValueError:
            accepting = False
        if item.get('notice_status') == 'closed':
            group = 'closed'
        elif group == 'eligible' and not accepting:
            group = 'needs_review'  # 적격이어도 접수가 닫혔다면 추천에서 제외
        score, breakdown, reasons = _score(item, preferences, weights, today) if group == 'eligible' else (None, {}, [])
        groups[group].append({**item, 'eligibility_status': status or 'not_evaluated', 'recommendation_score': score,
                              'score_breakdown': breakdown, 'recommendation_reasons': reasons, 'accepting': accepting})
    groups['eligible'].sort(key=lambda row: (row['recommendation_score'] is None,
                                             -(row['recommendation_score'] or 0), row['id']))
    return {
    'top3': groups['eligible'][:3],
    'needs_review': groups['needs_review'],
    'ineligible': groups['ineligible'],
    'unverified': groups['unverified'],
    'closed': groups['closed']
    }