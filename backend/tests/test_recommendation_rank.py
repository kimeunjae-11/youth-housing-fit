import unittest
from datetime import date
from recommendation_rank import rank_notices

class RecommendationRankTests(unittest.TestCase):
    def setUp(self):
        self.today=date(2026,11,17)
        base={'notice_status':'open','application_start':'2026-11-01','application_end':'2026-11-25',
              'region':'오산시','applicable_monthly_rent':100000}
        self.items=[{**base,'id':str(n),'applicable_monthly_rent':n*10000} for n in range(1,6)]
        self.prefs={'region':'오산시','max_monthly_rent':200000}
    def test_top3_only_individually_met(self):
        judgments={str(n):{'status':'met'} for n in range(1,6)}
        judgments['1']={'status':'not_met'}
        judgments['2']={'status':'needs_review'}
        result=rank_notices(self.items,judgments,self.prefs,today=self.today)
        self.assertEqual([r['id'] for r in result['top3']],['3','4','5'])
        self.assertEqual(len(result['ineligible']),1)
        self.assertEqual(len(result['needs_review']),1)
    def test_no_judgment_never_recommended(self):
        result=rank_notices(self.items,{},self.prefs,today=self.today)
        self.assertEqual(result['top3'],[])
        self.assertEqual(len(result['unverified']),5)
    def test_closed_not_recommended(self):
        item={**self.items[0],'notice_status':'closed'}
        result=rank_notices([item],{'1':{'status':'met'}},self.prefs,today=self.today)
        self.assertEqual(result['top3'],[])
    def test_missing_price_not_zero_score(self):
        item={**self.items[0],'applicable_monthly_rent':None}
        result=rank_notices([item],{'1':{'status':'met'}},self.prefs,today=self.today)
        self.assertIsNone(result['top3'][0]['score_breakdown']['rent'])

if __name__=='__main__': unittest.main()

class ExtendedRankingTests(unittest.TestCase):
    def setUp(self):
        self.day = date(2026, 11, 17)
        self.base = dict(region='오산시', notice_status='open', application_start='2026-11-01', application_end='2026-11-25', applicable_monthly_rent=150000)
        self.prefs = dict(region='오산시', max_monthly_rent=300000, min_area_sqm=25, max_deposit=30000000)
        self.weights = dict(region=0, rent=0, area=60, deposit=40, deadline=0)

    def test_area_and_deposit_change_order(self):
        items = [dict(self.base, id='small', area_sqm=15, deposit=10000000), dict(self.base, id='large', area_sqm=30, deposit=20000000)]
        judgments = {'small': {'status': 'met'}, 'large': {'status': 'met'}}
        result = rank_notices(items, judgments, self.prefs, self.weights, today=self.day)
        self.assertEqual([r['id'] for r in result['top3']], ['large', 'small'])
        self.assertEqual(result['top3'][0]['score_breakdown']['area'], 100)

    def test_custom_weights_reverse_order(self):
        items = [dict(self.base, id='small', area_sqm=15, deposit=10000000), dict(self.base, id='large', area_sqm=30, deposit=20000000)]
        judgments = {'small': {'status': 'met'}, 'large': {'status': 'met'}}
        result = rank_notices(items, judgments, self.prefs, dict(region=0,rent=0,area=10,deposit=90,deadline=0), today=self.day)
        self.assertEqual(result['top3'][0]['id'], 'small')

    def test_missing_area_is_not_treated_as_zero(self):
        item = dict(self.base, id='1', area_sqm=None, deposit=10000000)
        result = rank_notices([item], {'1': {'status': 'met'}}, self.prefs, self.weights, today=self.day)
        self.assertIsNone(result['top3'][0]['score_breakdown']['area'])

    def test_invalid_weight_rejected(self):
        with self.assertRaises(ValueError):
            rank_notices([], {}, {}, {'area': -1})
