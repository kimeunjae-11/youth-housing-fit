import { FieldMessage, RequiredMark, labelClass } from './FieldShell.jsx'

export default function SegmentedField({
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
    <fieldset className="flex min-w-0 flex-col gap-1">
      <legend className={`${labelClass} mb-1 p-0`}>
        {label}
        {required && <RequiredMark />}
      </legend>
      <div
        className={`grid h-[46px] grid-cols-2 gap-1.5 rounded-lg border bg-white p-1 ${
          error ? 'border-error' : 'border-line-strong'
        }`}
      >
        {options.map((option, index) => {
          const selected = value === option.value
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-center truncate rounded-md px-1 text-[14px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-ink ${
                selected
                  ? 'bg-accent font-semibold text-accent-ink'
                  : 'font-medium text-muted hover:text-ink'
              }`}
            >
              <input
                // 첫 번째 라디오에 id 를 줘서 에러 시 포커스를 이쪽으로 옮긴다
                id={index === 0 ? name : undefined}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(name, option.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? messageId : undefined}
                className="sr-only"
              />
              <span className="truncate">{option.label}</span>
            </label>
          )
        })}
      </div>
      <FieldMessage id={messageId} error={error} />
    </fieldset>
  )
}
