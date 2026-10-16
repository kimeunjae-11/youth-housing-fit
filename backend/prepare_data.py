"""Build MVP seed records, without inventing notice/rule bindings."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent

# 최소형(임대료 요약값과 같은 기준) 전용면적(㎡). 출처: 엑셀 2_건설형_타입별상세, 가장·주상5는 1_단지요약 메모
MIN_AREA_SQM={
    '오산가장 경기행복주택':21.5,
    '오산세교2 12단지(A-7블록)(행복)':16.41,
    '오산세교2 LH7단지(A-6블록) 행복·영구임대':21.4,
    '오산청학 1단지(H-1블록)(행복)':16.66,
    '오산청호 2단지(2블록)(행복)':16.78,
    '오산세교 주상5단지(1블록)(행복)':16.54,
}
# 동 정보는 엑셀에 있는 것만 채운다. (주상5단지는 도로명주소에 세교동 표기) 나머지는 확인 전까지 None
DISTRICT={'오산세교 주상5단지(1블록)(행복)':'세교동'}

def lh_notice_url(sheets):
    """8_공고_목록에서 LH 행복주택 2026.07.27 입주자격완화 공고 링크를 찾는다. 없으면 None."""
    for row in sheets.get('8_공고_목록',[])[1:]:
        if row[0] and '행복주택 입주자격완화' in str(row[0]) and '2026.07.27' in str(row[0]) and str(row[7] or '').startswith('http'):
            return row[7]
    return None

def build():
    raw=json.loads((ROOT/'data/osan-source.json').read_text(encoding='utf-8'))
    rows=raw['sheets']['1_단지요약']; listings=[]
    for n,row in enumerate(rows[1:],2):
        if row[1]!='행복주택': continue
        gh=row[0]=='오산가장 경기행복주택'
        listings.append(dict(id=hashlib.sha256(row[0].encode()).hexdigest()[:16],name=row[0],
            housing_type=row[1],address=row[2],district=DISTRICT.get(row[0]),area_sqm=MIN_AREA_SQM.get(row[0]),
            deposit=row[7] if type(row[7]) in (int,float) else None,
            monthly_rent=row[8] if type(row[8]) in (int,float) else None,
            price_scope='최소형·청년 소득 없음 기준 요약값',
            rent_verified=False,rent_income_group='no_income',
            notice_status='closed' if '접수마감' in (row[9] or '') else 'unknown',
            application_start='2026-05-04' if gh else None,application_end='2026-05-08' if gh else None,
            notice_url='https://apply.gh.or.kr/sb/sr/sr7150/selectPbancDetailView.do?pbancNo=788' if gh else lh_notice_url(raw['sheets']),
            rule_id='gh-osangajang-youth-20260423' if gh else None,
            data_as_of=row[10],source={'sheet':'1_단지요약','row':n},
            source_note=row[11],caveat=row[12],recruitment_note=row[9],
            verification_status='partial' if gh else 'notice_binding_unverified'))
    result=dict(data_as_of='2026-10-15',source_sha256=raw['source_sha256'],listings=listings)
    (ROOT/'data/housing.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'행복주택 {len(listings)}개 항목 저장. LH 5개 + GH 기준 확인용 1개')
if __name__=='__main__': build()
