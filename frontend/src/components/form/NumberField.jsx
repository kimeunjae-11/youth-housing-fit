import { FieldMessage, RequiredMark, labelClass } from './FieldShell.jsx'

export default function NumberField({
  name,
  label,
  unit,
  placeholder,
  hint,
  required = false,
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
          className={`h-[42px] w-full rounded-xl border bg-white px-3.5 pr-12 text-[13px] font-semibold text-ink transition-all placeholder:font-normal placeholder:text-subtle focus:outline-none focus:ring-2 ${
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-line-strong focus:border-accent focus:ring-accent/20'
          }`}
        />
        <span className="pointer-events-none absolute right-3.5 text-[13px] font-medium text-subtle">
          {unit}
        </span>
      </div>
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  )
}
