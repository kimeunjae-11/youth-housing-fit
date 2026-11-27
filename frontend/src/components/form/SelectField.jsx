import { FieldMessage, OptionalMark, RequiredMark, labelClass } from './FieldShell.jsx'
import { inputClass } from './fieldStyles.js'

export default function SelectField({ name, label, options, required = false, optional = false, value, error, onChange }) {
  const messageId = `${name}-message`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <RequiredMark />}
        {optional && <OptionalMark />}
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
          className={`${inputClass(error)} cursor-pointer appearance-none pr-10`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-fit-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <FieldMessage id={messageId} error={error} />
    </div>
  )
}
