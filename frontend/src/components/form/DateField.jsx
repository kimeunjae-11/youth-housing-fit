import { FieldMessage, OptionalMark, RequiredMark, labelClass } from './FieldShell.jsx'
import { inputClass } from './fieldStyles.js'

// 날짜 입력 (값은 'YYYY-MM-DD' 문자열). NumberField 와 같은 모양으로 맞춘다.
export default function DateField({ name, label, hint, required = false, optional = false, value, error, onChange }) {
  const messageId = `${name}-message`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <RequiredMark />}
        {optional && <OptionalMark />}
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
        className={inputClass(error)}
      />
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  )
}
