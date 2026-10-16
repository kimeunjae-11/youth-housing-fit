"""MVP service layer. Applicant input is never persisted."""
import json
import math
from pathlib import Path
from datetime import datetime, date
from zoneinfo import ZoneInfo

ROOT=Path(__file__).resolve().parent.parent
def read(name):
    return json.loads((ROOT/'data'/name).read_text(encoding='utf-8'))

def validate(p):
    if not isinstance(p,dict): raise ValueError('입력은 JSON 객체여야 합니다')
    required={'age':'만 나이','monthly_income':'월평균 소득','total_assets':'총자산',
              'homeless':'무주택 여부','housing_subscription':'청약통장','marital_status':'혼인 상태','region':'희망 지역'}
    missing=[label for key,label in required.items() if p.get(key) is None or isinstance(p.get(key),str) and not p[key].strip()]
    if p.get('income_scope')=='household' and p.get('household_size') is None:
        missing.append('가구원 수')
    if missing: raise ValueError('필수 항목을 입력하세요: '+', '.join(missing))
    numeric={'age','monthly_income','total_assets','car_value','household_size','children_after_20230328','max_monthly_rent'}
    boolean={'homeless','housing_subscription'}
    strings={'region','marital_status','income_scope'}
    if set(p)-(numeric|boolean|strings): raise ValueError('지원하지 않는 입력 항목이 있습니다')
    for k in numeric:
        v=p.get(k)
        if v is not None and (type(v) not in (int,float) or not math.isfinite(v) or not 0<=v<=10**15):
            raise ValueError(f'{k}: 0 이상의 유한한 숫자가 필요합니다')
    for k,lo,hi in [('age',0,120),('household_size',1,30),('children_after_20230328',0,30)]:
        v=p.get(k)
        if v is not None and (int(v)!=v or not lo<=v<=hi): raise ValueError(f'{k}: {lo}~{hi} 정수가 필요합니다')
    for k in boolean:
        if p.get(k) is not None and type(p[k]) is not bool: raise ValueError(f'{k}: true/false가 필요합니다')
    for k in strings:
        if p.get(k) is not None and (not isinstance(p[k],str) or not p[k].strip() or len(p[k])>100): raise ValueError(f'{k}: 문자열이 필요합니다')
    if p.get('income_scope') not in (None,'self','household'): raise ValueError('income_scope: self 또는 household')
    if p.get('marital_status') not in (None,'single','married'): raise ValueError('marital_status: single 또는 married')

def judge(p,rules=None):
    validate(p)
    r=rules if rules is not None else read('eligibility-rules.json')
    checks=[]
    def add(field,label,passed,criterion,reason,excess=None):
        v=p.get(field)
        checks.append(dict(field=field,label=label,input_value=v,criterion=criterion,
            status='unknown' if v is None or passed is None else 'met' if passed else 'not_met',
            reason=reason,excess_amount=excess))
    age=p.get('age')
    ageok=age is not None and r['age_min']<=age<=r['age_max']
    add('age','나이',True if ageok else None,{'min':r['age_min'],'max':r['age_max']},
        '공고일 기준 나이 범위 충족' if ageok else '공고일 만 나이 입력 필요 또는 사회초년생 예외 확인 필요')
    children=p.get('children_after_20230328')
    idx=min(int(children),2) if children is not None else None
    n=1 if p.get('income_scope')=='self' else p.get('household_size') if p.get('income_scope')=='household' else None
    limit=None
    if n is not None and children==0:
        n=int(n); limit=r['income_limits'][n-1] if n<=len(r['income_limits']) else r['income_limits'][-1]+(n-len(r['income_limits']))*r['income_extra_person']
    for field,label,maximum in [('monthly_income','월평균소득',limit),
        ('total_assets','순자산',r['asset_limits'][idx] if idx is not None else None),
        ('car_value','자동차 가액',r['car_limits'][idx] if idx is not None else None)]:
        value=p.get(field); passed=value<=maximum if value is not None and maximum is not None else None
        excess=max(0,value-maximum) if passed is not None else None
        reason='심사 범위·자녀 수·입력값 확인 필요' if passed is None else f'{label} 기준 충족' if passed else f'{label} 기준 {excess:,.0f}원 초과'
        add(field,label,passed,{'max':maximum,'unit':'KRW'},reason,excess)
    add('homeless','본인 무주택',p.get('homeless') is True,True,'본인 무주택 여부 확인')
    add('marital_status','혼인 상태',p.get('marital_status')=='single','single','혼인 중이 아닐 것')
    add('housing_subscription','청약통장',True if p.get('housing_subscription') is True else None,
        r['subscription_deadline'],'현재 미가입만으로 탈락하지 않음. 입주 전 가입 증명 필요')
    status='not_met' if any(c['status']=='not_met' for c in checks) else 'needs_review' if any(c['status']=='unknown' for c in checks) or not r['rules_complete'] else 'met'
    assessed=[c for c in checks if c['status']!='unknown']
    basic_status='not_met' if any(c['status']=='not_met' for c in assessed) else 'met' if assessed else 'needs_review'
    review=[dict(field=c['field'],reason=c['reason']) for c in checks if c['status']=='unknown']
    review.extend(dict(field='notice_rule',reason=reason) for reason in r.get('unimplemented',[]))
    return dict(status=status,basic_status=basic_status,
        basic_message='검사한 기본조건 충족' if basic_status=='met' else '검사한 기본조건 미충족' if basic_status=='not_met' else '판정 가능한 입력 필요',
        assessed_count=len(assessed),unknown_count=len(checks)-len(assessed),additional_review=review,
        checks=checks,rule_id=r['id'],rules_complete=r['rules_complete'],
        source_url=r['source_url'],source_note=r['source_note'],basis_date=r['notice_date'],
        scope='오산가장 GH 청년 기준 사전검토. 다른 LH 공고 자격으로 공통 적용하지 않습니다.',
        message='미충족' if status=='not_met' else '추가 확인 필요' if status=='needs_review' else '등록 기준 충족')

def recruitment_status(item,today):
    start,end=item.get('application_start'),item.get('application_end')
    if item.get('notice_status')=='closed': return 'closed'
    if not start or not end: return 'unknown'
    # Include the final day; exact closing time still needs the notice.
    return 'upcoming' if today<date.fromisoformat(start) else 'closed' if today>date.fromisoformat(end) else 'open'

def recommend(p, catalog=None, rules=None, today=None):
    judgment=judge(p,rules)
    catalog=catalog if catalog is not None else read('housing.json')
    today=today or datetime.now(ZoneInfo('Asia/Seoul')).date()
    items=[]
    for item in catalog['listings']:
        region=p.get('region') or '오산시 전체'
        if region not in ('오산시','오산시 전체',item.get('district')): continue
        rent=item.get('monthly_rent')
        # Summary prices are retained for reference, never treated as applicant prices.
        group=item.get('rent_income_group')
        own_income=p.get('monthly_income') if p.get('income_scope')=='self' else None
        applicable=(item.get('rent_verified') is True and (group=='all' or
                    own_income is not None and group==('no_income' if own_income==0 else 'income')))
        effective_rent=rent if applicable else None
        budget=p.get('max_monthly_rent')
        if effective_rent is not None and budget is not None and effective_rent>budget: continue
        # 적용 임대료를 확인하지 못해도 요약 참고가가 이미 상한보다 비싸면 목록에서 뺀다. (상한 이내는 '예산 충족 미확인'으로 유지)
        if effective_rent is None and rent is not None and budget is not None and rent>budget: continue
        state=recruitment_status(item,today)
        reasons=['희망 지역 일치']
        reasons.append('적용 임대료 추가 확인 필요 · 예산 충족 미확인' if effective_rent is None else '희망 월세 이내' if budget is not None else '검증된 임대조건 참고')
        items.append({**item,'recruitment_status':state,'rent_needs_review':effective_rent is None,
            'applicable_monthly_rent':effective_rent,
            'budget_status':'unknown' if effective_rent is None else 'not_requested' if budget is None else 'within_budget',
            'price_label':'요약 참고 가격 · 사용자 적용 금액 미확인' if effective_rent is None else '대상별 확인된 가격',
            'match_reasons':reasons,'eligibility_status':'not_evaluated',
            'status_label':{'closed':'접수 마감 · 참고용','open':'수집 일정상 접수 중 · 원문 확인 필요','upcoming':'접수 예정 · 원문 확인 필요','unknown':'모집상태 확인 필요'}[state],
            'cautions':['기본조건 진단과 별개인 지역·월세 탐색 결과입니다. 해당 공고 신청자격을 확인하세요.',item.get('price_scope') or '임대조건 적용 대상 확인 필요']})
    items.sort(key=lambda x:(x['applicable_monthly_rent'] is None,x['applicable_monthly_rent'] or 0,x['id']))
    return dict(eligibility=judgment,results=items,total=len(items),data_as_of=catalog['data_as_of'],
        evaluated_at=str(today),mode='reference_exploration',
        message='지역·월세에 맞는 참고용 주택 목록입니다. 자격 충족 또는 현재 신청 가능을 뜻하지 않습니다.')
