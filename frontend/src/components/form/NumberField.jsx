import { FieldMessage, OptionalMark, RequiredMark, labelClass } from './FieldShell.jsx'
import { inputClass } from './fieldStyles.js'

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
  note,
}) {
  const messageId = `${name}-message`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <RequiredMark />}
        {optional && <OptionalMark />}
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
          className={`${inputClass(error)} pr-14 [font-feature-settings:'tnum']`}
        />
        <span className="pointer-events-none absolute right-4 text-[15px] text-fit-muted">{unit}</span>
      </div>
      {note}
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  )
}
