"""Build MVP seed records, without inventing notice/rule bindings."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
def build():
    raw=json.loads((ROOT/'data/osan-source.json').read_text(encoding='utf-8'))
    rows=raw['sheets']['1_단지요약']; listings=[]
    for n,row in enumerate(rows[1:],2):
        if row[1]!='행복주택': continue
        gh=row[0]=='오산가장 경기행복주택'
        listings.append(dict(id=hashlib.sha256(row[0].encode()).hexdigest()[:16],name=row[0],
            housing_type=row[1],address=row[2],district=None,area_sqm=None,
            deposit=row[7] if type(row[7]) in (int,float) else None,
            monthly_rent=row[8] if type(row[8]) in (int,float) else None,
            price_scope='최소형·청년 소득 없음 기준 요약값',
            rent_verified=False,rent_income_group='no_income',
            notice_status='closed' if '접수마감' in (row[9] or '') else 'unknown',
            application_start='2026-05-04' if gh else None,application_end='2026-05-08' if gh else None,
            notice_url='https://apply.gh.or.kr/sb/sr/sr7150/selectPbancDetailView.do?pbancNo=788' if gh else None,
            rule_id='gh-osangajang-youth-20260423' if gh else None,
            data_as_of=row[10],source={'sheet':'1_단지요약','row':n},
            source_note=row[11],caveat=row[12],recruitment_note=row[9],
            verification_status='partial' if gh else 'notice_binding_unverified'))
    result=dict(data_as_of='2026-10-15',source_sha256=raw['source_sha256'],listings=listings)
    (ROOT/'data/housing.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'행복주택 {len(listings)}개 항목 저장. LH 5개 + GH 기준 확인용 1개')
if __name__=='__main__': build()
