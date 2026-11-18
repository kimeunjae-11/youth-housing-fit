
import { useEffect, useState } from 'react'
import { postJson } from '../../api/client.js'

// 은재의 입력값을 지은이 정책 추천 API 형식으로 변환
function buildPolicyRequest(condition) {
  const homeless = condition.homeless_status === 'homeless'

  return {
    age_years: condition.age,
    married: condition.marital_status === 'married',

    // 무주택 세대인 경우만 본인·세대 모두 무주택으로 판단
    // 주택 보유인 경우 본인 명의인지는 확인되지 않음
    applicant_owns_home: homeless ? false : null,
    household_owns_home: !homeless,

    has_subscription:
      condition.subscription_account === 'active',

    applicant_monthly_income_krw:
      condition.income * 10000,

    vehicle_value_krw:
      condition.car_value == null
        ? null
        : condition.car_value * 10000,

    housing_goal: 'rent',
    rental_preference: 'public_complex',

    // 기존 입력 화면에 없는 정보는 임의로 채우지 않음
    is_student: null,
    is_job_seeker: null,
  }
}

export default function PolicyRecommendation({ condition }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    setState({ status: 'loading' })

    postJson(
      '/api/policy-recommendations',
      buildPolicyRequest(condition),
      '청년 주거정책 추천 결과를 불러오지 못했어요.'
    )
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'success', data })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error.message,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [condition])

  const recommendation = state.data?.recommendation

  return (
    <section className="rounded-xl border border-line-strong bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold text-accent-ink">
        청년 주거정책 맞춤 추천
      </h2>

      {state.status === 'loading' && (
        <p className="text-sm text-muted">
          적합한 정책을 찾고 있어요...
        </p>
      )}

      {state.status === 'error' && (
        <p className="text-sm text-muted">
          {state.message}
        </p>
      )}

      {state.status === 'success' && !recommendation && (
        <p className="text-sm text-muted">
          {state.data.message || '추천 가능한 정책 후보가 없습니다.'}
        </p>
      )}

      {state.status === 'success' && recommendation && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-accent-ink">
              추천 정책 후보
            </p>
            <h3 className="mt-1 text-xl font-semibold text-ink">
              {recommendation.name}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {recommendation.summary}
            </p>
          </div>

          {recommendation.reasons?.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold text-ink">
                추천 이유
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {recommendation.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.to_verify?.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold text-ink">
                추가 확인이 필요한 조건
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {recommendation.to_verify.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted">
            현재 입력 정보에 따른 정책 후보입니다.
            실제 신청 자격은 개별 모집공고에서 확인해야 합니다.
          </p>
        </div>
      )}
    </section>
  )
}
