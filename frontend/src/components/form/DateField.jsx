import { FieldMessage, RequiredMark, labelClass } from './FieldShell.jsx'

// 날짜 입력 (값은 'YYYY-MM-DD' 문자열). NumberField 와 같은 모양으로 맞춘다.
export default function DateField({
  name,
  label,
  hint,
  required = false,
  optional = false,
  value,
  error,
  onChange,
}) {
  const messageId = `${name}-message`

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <RequiredMark />}
        {optional && <span className="text-[13px] font-normal text-muted">(선택)</span>}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={`h-[46px] w-full rounded-lg border bg-white px-3.5 text-base font-medium text-ink transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-line-strong focus:border-accent-ink focus:ring-accent/40'
        }`}
      />
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  )
}
