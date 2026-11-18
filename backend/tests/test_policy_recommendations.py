"""정책 추천 API와 팀 WSGI 서버의 연동 검사."""
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import app
from housing_recommender import load_income_tables


class PolicyApiTests(unittest.TestCase):
    def request(self, path='/api/policy-recommendations', profile=None,
                method='POST', content_type='application/json', raw=None):
        body = raw if raw is not None else json.dumps(profile or {}).encode()
        environment = {
            'REQUEST_METHOD': method, 'PATH_INFO': path, 'CONTENT_TYPE': content_type,
            'CONTENT_LENGTH': str(len(body)), 'wsgi.input': io.BytesIO(body),
            'HTTP_ORIGIN': 'http://localhost:5173',
        }
        captured = {}

        def start_response(status, headers):
            captured['status'] = status.split()[0]
            captured['headers'] = dict(headers)

        captured['body'] = b''.join(app.application(environment, start_response))
        return captured

    def test_all_seven_policy_paths_through_wsgi(self):
        profile = {
            'age_years': 23, 'married': False, 'applicant_owns_home': False,
            'household_owns_home': False, 'household_head': False,
            'housing_goal': 'rent', 'applicant_monthly_income_krw': 2000000,
        }
        cases = [
            ({'rental_preference': 'public_complex'}, 'happy_housing'),
            ({'age_years': 18, 'rental_preference': 'public_complex'}, 'integrated_public_rental'),
            ({'rental_preference': 'find_jeonse', 'welfare_qualifications': ['near_poverty']}, 'youth_jeonse_rental'),
            ({'rental_preference': 'existing_public_home', 'welfare_qualifications': ['near_poverty']}, 'youth_purchase_rental'),
            ({'rental_preference': 'private_rental'}, 'public_supported_private_rental'),
            ({'housing_goal': 'rent_then_optional_purchase', 'applicant_ever_owned_home': False,
              'subscription_months': 6, 'subscription_payment_count': 6}, 'newhome_choice'),
            ({'housing_goal': 'purchase', 'household_ever_owned_home': False,
              'private_subscription_first_rank': True, 'income_tax_years': 5}, 'private_sale_first_time'),
        ]
        # 검증용 월액. 실제 정책 기준표와 구별한다.
        tables = {'urban_worker_previous_year_monthly_average': {'1': 3000000}}
        with patch.object(app, 'POLICY_INCOME_TABLES', tables):
            for additions, policy_id in cases:
                with self.subTest(policy_id=policy_id):
                    response = self.request(profile=profile | additions)
                    data = json.loads(response['body'])
                    self.assertEqual(response['status'], '200')
                    self.assertEqual(data['recommendation']['policy_id'], policy_id)
                    self.assertTrue(data['recommendation']['sources'])
                    self.assertEqual(response['headers']['Access-Control-Allow-Origin'], 'http://localhost:5173')

    def test_income_boundary_and_no_forced_recommendation(self):
        profile = {
            'age_years': 23, 'married': False, 'applicant_owns_home': False,
            'housing_goal': 'rent_then_optional_purchase', 'applicant_ever_owned_home': False,
            'subscription_months': 6, 'subscription_payment_count': 6,
            'applicant_monthly_income_krw': 4200000,
        }
        tables = {'urban_worker_previous_year_monthly_average': {'1': 3000000}}
        with patch.object(app, 'POLICY_INCOME_TABLES', tables):
            data = json.loads(self.request(profile=profile)['body'])
            self.assertEqual(data['recommendation']['policy_id'], 'newhome_choice')
            data = json.loads(self.request(profile=profile | {'applicant_monthly_income_krw': 4200001})['body'])
            self.assertEqual(data['status'], 'no_recommendation')
            self.assertIsNone(data['recommendation'])

    def test_missing_income_table_requires_review(self):
        with patch.object(app, 'POLICY_INCOME_TABLES', {}):
            response = self.request(profile={
                'age_years': 23, 'married': False, 'applicant_owns_home': False,
                'household_head': False, 'applicant_monthly_income_krw': 0,
                'housing_goal': 'rent_then_optional_purchase',
            })
        data = json.loads(response['body'])
        self.assertEqual(data['status'], 'needs_info')
        self.assertIn('소득 기준', data['recommendation']['to_verify'])

    def test_policy_errors_follow_team_api_contract(self):
        for options, status in [
            ({'raw': b'{'}, '422'), ({'profile': {'married': 0}}, '422'),
            ({'content_type': 'text/plain'}, '415'), ({'raw': b'x' * 16385}, '413'),
            ({'method': 'GET'}, '405'), ({'method': 'OPTIONS'}, '200'),
        ]:
            with self.subTest(options={key: str(value)[:40] for key, value in options.items()}):
                response = self.request(**options)
                self.assertEqual(response['status'], status)
                self.assertEqual(response['headers']['Access-Control-Allow-Origin'], 'http://localhost:5173')

    def test_demo_uses_integrated_endpoint(self):
        response = self.request(path='/demo', method='GET')
        self.assertEqual(response['status'], '200')
        self.assertEqual(response['headers']['Content-Type'], 'text/html; charset=utf-8')
        self.assertIn(b'fetch("/api/policy-recommendations"', response['body'])
        self.assertNotIn(b'fetch("/recommend"', response['body'])
        head = self.request(path='/demo', method='HEAD')
        self.assertEqual(head['body'], b'')
        self.assertEqual(head['headers']['Content-Length'], response['headers']['Content-Length'])

    def test_income_table_configuration(self):
        self.assertEqual(load_income_tables(), {})
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'table.json'
            table = {'national_median_income': {'1': 1000000}}
            path.write_text(json.dumps(table))
            self.assertEqual(load_income_tables(path), table)
            for table in ([], {'national_median_income': {'0': 100}}, {'x': {'1': True}}):
                path.write_text(json.dumps(table))
                with self.assertRaises(ValueError):
                    load_income_tables(path)


if __name__ == '__main__':
    unittest.main()
