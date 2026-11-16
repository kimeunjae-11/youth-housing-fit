import { FieldMessage, RequiredMark, labelClass } from './FieldShell.jsx'

export default function NumberField({
  name,
  label,
  unit,
  placeholder,
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
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type="number"
          inputMode="numeric"
          min="0"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={`h-[46px] w-full rounded-lg border bg-white px-3.5 pr-14 text-base font-medium text-ink transition-colors placeholder:font-normal placeholder:text-muted focus:outline-none focus:ring-2 ${
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-line-strong focus:border-accent-ink focus:ring-accent/40'
          }`}
        />
        <span className="pointer-events-none absolute right-3.5 text-[15px] text-muted">
          {unit}
        </span>
      </div>
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  )
}
