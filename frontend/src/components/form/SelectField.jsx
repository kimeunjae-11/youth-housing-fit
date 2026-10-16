import { FieldMessage, RequiredMark, labelClass } from './FieldShell.jsx'

export default function SelectField({
  name,
  label,
  options,
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
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? messageId : undefined}
          className={`h-[42px] w-full cursor-pointer appearance-none rounded-xl border bg-white px-3.5 pr-8 text-[13px] font-semibold text-ink transition-all focus:outline-none focus:ring-2 ${
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-line-strong focus:border-accent focus:ring-accent/20'
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[20px] text-subtle"
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>
      <FieldMessage id={messageId} error={error} />
    </div>
  )
}
