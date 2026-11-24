import { useEffect, useState } from 'react'
import { postJson } from '../../api/client.js'

// 조건 입력값 → 정책 추천 API(/api/policy-recommendations) 요청
function buildPolicyRequest(condition) {
  const homeless = condition.homeless_status === 'homeless'
  const activity = condition.student_status ?? null

  return {
    age_years: condition.age,
    married: condition.marital_status === 'married',

    // 무주택 세대인 경우만 본인·세대 모두 무주택으로 판단
    // 주택 보유인 경우 본인 명의인지는 확인되지 않음
    applicant_owns_home: homeless ? false : null,
    household_owns_home: !homeless,

    has_subscription: condition.subscription_account === 'active',
    applicant_monthly_income_krw: condition.income * 10000,
    vehicle_value_krw: condition.car_value == null ? null : condition.car_value * 10000,

    housing_goal: 'rent',
    // 예전 화면에서 넘어온 condition 에는 값이 없을 수 있어 그때는 공공임대 단지로 본다
    rental_preference: condition.rental_preference === undefined ? 'public_complex' : condition.rental_preference,

    // 선택하지 않았으면 모름(null)으로 보내 '추가 확인'으로 남긴다
    is_student: activity === null ? null : activity === 'student',
    is_job_seeker: activity === null ? null : activity === 'job_seeker',
  }
}

const STATUS_BADGE = {
  potential_match: { label: '입력 조건에 맞는 후보', className: 'bg-ok-soft text-ok' },
  needs_info: { label: '추가 확인 필요', className: 'bg-transparent text-accent-ink ring-1 ring-stage-line' },
}

function CheckList({ items, icon, iconClass }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[14px] text-ink">
          <span className={`material-symbols-outlined mt-px text-[18px] ${iconClass}`} aria-hidden="true">
            {icon}
          </span>
          <span className="min-w-0 break-keep">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PolicyRecommendation({ condition }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    postJson('/api/policy-recommendations', buildPolicyRequest(condition), '청년 주거정책 추천을 불러오지 못했어요.')
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', message: error.message })
      })
    return () => {
      cancelled = true
    }
  }, [condition])

  const recommendation = state.data?.recommendation
  const badge = STATUS_BADGE[state.data?.status]

  return (
    <section
      aria-labelledby="policy-heading"
      aria-busy={state.status === 'loading'}
      className="flex flex-col gap-4 border-t border-line-soft pt-5"
    >
      <h2 id="policy-heading" className="text-[20px] font-semibold tracking-[-0.02em] text-accent-ink">
        청년 주거정책 추천
      </h2>

      {state.status === 'loading' && (
        <p role="status" className="text-[14px] text-muted">
          입력하신 조건에 맞는 정책을 찾고 있어요…
        </p>
      )}

      {state.status === 'error' && (
        <p role="alert" className="text-[14px] text-muted">
          {state.message}
        </p>
      )}

      {state.status === 'success' && !recommendation && (
        <p className="text-[14px] text-muted">{state.data.message || '입력으로 추천할 정책 후보를 찾지 못했어요.'}</p>
      )}

      {state.status === 'success' && recommendation && (
        <>
          <div className="rounded-xl bg-accent-soft p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-accent-ink">
                {recommendation.supply_type}
              </span>
              {badge && (
                <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${badge.className}`}>{badge.label}</span>
              )}
            </div>
            <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-accent-ink">{recommendation.name}</h3>
            <p className="mt-1.5 break-keep text-[15px] leading-[1.6] text-ink">{recommendation.summary}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {recommendation.reasons?.length > 0 && (
              <div>
                <h4 className="mb-2 text-[15px] font-semibold text-ink">추천 이유</h4>
                <CheckList items={recommendation.reasons} icon="check_circle" iconClass="text-ok" />
              </div>
            )}
            {recommendation.to_verify?.length > 0 && (
              <div>
                <h4 className="mb-2 text-[15px] font-semibold text-ink">추가로 확인할 조건</h4>
                <CheckList items={recommendation.to_verify} icon="help" iconClass="text-muted" />
              </div>
            )}
          </div>

          {recommendation.notice_checks?.length > 0 && (
            <details className="group rounded-lg bg-surface-container-low px-4 py-3">
              <summary className="flex min-h-[28px] cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-ink">
                모집공고에서 확인할 내용 {recommendation.notice_checks.length}가지
                <span
                  className="material-symbols-outlined text-[18px] text-muted transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </summary>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[14px] text-muted">
                {recommendation.notice_checks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          )}

          {recommendation.sources?.length > 0 && (
            <p className="text-[13px] text-muted">
              출처:{' '}
              {recommendation.sources.map((source, index) => (
                <span key={source.url}>
                  {index > 0 && ' · '}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent-ink underline"
                  >
                    {source.name}
                  </a>
                </span>
              ))}
            </p>
          )}

          <p className="text-[13px] text-muted">
            입력한 정보로 고른 정책 후보 1개예요. 실제 신청 자격은 개별 모집공고에서 확인해 주세요.
          </p>
        </>
      )}
    </section>
  )
}
