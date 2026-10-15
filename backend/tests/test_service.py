import copy,io,json,unittest
from datetime import date
from service import judge,recommend,read,validate
from app import application

class ServiceTests(unittest.TestCase):
    def setUp(self):
        self.p=dict(age=26,monthly_income=2500000,total_assets=50000000,car_value=0,
            household_size=1,children_after_20230328=0,income_scope='self',marital_status='single',
            homeless=True,housing_subscription=True,region='오산시 전체',max_monthly_rent=200000)
        self.rules=read('eligibility-rules.json')

    def test_income_boundary_and_reason(self):
        self.assertNotEqual(judge(self.p|{'monthly_income':4576036})['status'],'not_met')
        result=judge(self.p|{'monthly_income':4576037})
        self.assertEqual(result['status'],'not_met')
        check=next(c for c in result['checks'] if c['field']=='monthly_income')
        self.assertEqual(check['excess_amount'],1)
        self.assertEqual(check['input_value'],4576037)

    def test_missing_never_passes(self):
        for field in ['age','monthly_income','total_assets','homeless','housing_subscription','marital_status','region']:
            for value in [None,'']:
                with self.assertRaisesRegex(ValueError,'필수 항목'): judge(self.p|{field:value})
        with self.assertRaises(ValueError): judge({})

    def test_age_exception_and_subscription_timing(self):
        self.assertEqual(judge(self.p|{'age':40,'housing_subscription':False})['status'],'needs_review')

    def test_no_invented_actual_eligibility(self):
        result=recommend(self.p,today=date(2026,10,15))
        self.assertGreater(result['total'],0)
        self.assertFalse(result['eligibility']['rules_complete'])
        self.assertEqual(result['eligibility']['basic_status'],'met')
        self.assertEqual(result['eligibility']['status'],'needs_review')
        self.assertTrue(all(x['eligibility_status']=='not_evaluated' for x in result['results']))
        self.assertTrue(all(x['recruitment_status']=='closed' for x in result['results']))

    def test_real_data_closed(self):
        listings=read('housing.json')['listings']
        self.assertEqual(len(listings),6)
        self.assertTrue(all(x['notice_status']=='closed' for x in listings))
        self.assertEqual(len([x for x in listings if x['rule_id']]),1)

    def test_rules_loaded_from_data(self):
        changed=copy.deepcopy(self.rules); changed['asset_limits'][0]=100
        self.assertEqual(judge(self.p,changed)['status'],'not_met')

    def test_filter_with_explicit_synthetic_fixtures(self):
        # Fictional open notices used only in tests; never mixed with real data.
        rules=copy.deepcopy(self.rules); rules['rules_complete']=True
        base=dict(rent_verified=True,rent_income_group='all',rule_id=rules['id'],district='금암동',application_start='2026-10-01',application_end='2026-10-31',notice_status='open')
        rows=[base|dict(id='synthetic-missing-rent',monthly_rent=None),
              base|dict(id='synthetic-cheap',monthly_rent=150000),
              base|dict(id='synthetic-expensive',monthly_rent=200001),
              base|dict(id='synthetic-closed',monthly_rent=100000,notice_status='closed'),
              base|dict(id='synthetic-wrong-rule',monthly_rent=100000,rule_id='other')]
        catalog=dict(data_as_of='2026-10-15',listings=rows)
        result=recommend(self.p|{'region':'금암동'},catalog,rules,date(2026,10,15))
        self.assertEqual({x['id'] for x in result['results']},{'synthetic-cheap','synthetic-missing-rent','synthetic-closed','synthetic-wrong-rule'})
        self.assertTrue(result['results'][-1]['rent_needs_review'])
        self.assertEqual(recommend(self.p|{'region':'청호동'},catalog,rules,date(2026,10,15))['total'],0)
        failed=recommend(self.p|{'homeless':False},catalog,rules,date(2026,10,15))
        self.assertEqual(failed['eligibility']['basic_status'],'not_met')
        self.assertEqual(failed['total'],result['total'])

    def test_missing_checks_separate_from_assessed_checks(self):
        partial=judge({k:v for k,v in self.p.items() if k not in ('car_value','income_scope','household_size','children_after_20230328')})
        self.assertEqual(partial['status'],'needs_review')
        self.assertGreater(partial['unknown_count'],0)
        self.assertTrue(partial['additional_review'])

    def test_zero_false_and_conditional_household(self):
        validate(self.p|dict(monthly_income=0,total_assets=0,homeless=False,housing_subscription=False))
        with self.assertRaisesRegex(ValueError,'가구원 수'):
            validate(self.p|dict(income_scope='household',household_size=None))

    def test_actual_exploration_budget_and_reasons(self):
        result=recommend(self.p|{'max_monthly_rent':80000},today=date(2026,10,15))
        self.assertGreater(result['total'],0)
        for item in result['results']:
            self.assertIsNone(item['applicable_monthly_rent'])
            self.assertEqual(item['budget_status'],'unknown')
            self.assertTrue(item['rent_needs_review'])
            self.assertNotIn('희망 월세 이내',item['match_reasons'])
            self.assertIn('접수 마감',item['status_label'])

    def test_price_scope_and_verified_budget(self):
        base=dict(id='test',district='금암동',monthly_rent=100000,rent_verified=True,rent_income_group='no_income')
        catalog=dict(data_as_of='2026-10-15',listings=[base])
        result=recommend(self.p|dict(max_monthly_rent=1),catalog)
        self.assertEqual(result['total'],1)
        self.assertEqual(result['results'][0]['budget_status'],'unknown')
        self.assertEqual(recommend(self.p|dict(monthly_income=0,max_monthly_rent=99999),catalog)['total'],0)
        item=recommend(self.p|dict(monthly_income=0,max_monthly_rent=100000),catalog)['results'][0]
        self.assertEqual(item['applicable_monthly_rent'],100000)
        self.assertEqual(item['budget_status'],'within_budget')
        item=recommend(self.p|dict(income_scope='household',monthly_income=0),catalog)['results'][0]
        self.assertEqual(item['budget_status'],'unknown')
        catalog['listings'][0].pop('rent_verified')
        self.assertEqual(recommend(self.p,catalog)['results'][0]['budget_status'],'unknown')

    def test_invalid_inputs(self):
        for p in [[],{'age':True},{'age':20.5},{'monthly_income':float('nan')},{'total_assets':-1},
            {'homeless':'false'},{'marital_status':[]},{'name':'홍길동'}]:
            with self.assertRaises(ValueError): validate(self.p|p if isinstance(p,dict) else p)

    def test_http_cors_and_error(self):
        for profile,code in [(self.p,'200'),({},'422'),({'age':True},'422')]:
            body=json.dumps(profile).encode(); captured=[]
            response=application(dict(REQUEST_METHOD='POST',PATH_INFO='/api/eligibility',CONTENT_TYPE='application/json',
                CONTENT_LENGTH=str(len(body)),HTTP_ORIGIN='https://youth-housing-fit.vercel.app',**{'wsgi.input':io.BytesIO(body)}),lambda s,h:captured.extend([s,dict(h)]))
            json.loads(b''.join(response))
            self.assertTrue(captured[0].startswith(code))
            self.assertEqual(captured[1]['Access-Control-Allow-Origin'],'https://youth-housing-fit.vercel.app')

if __name__=='__main__': unittest.main()
