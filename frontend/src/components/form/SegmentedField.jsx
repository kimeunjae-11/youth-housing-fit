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
        className={`grid h-[42px] grid-cols-2 gap-1.5 rounded-xl border bg-white p-1 ${
          error ? 'border-error' : 'border-line-strong'
        }`}
      >
        {options.map((option, index) => {
          const selected = value === option.value
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-center gap-1 truncate rounded-lg px-1 text-[13px] transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
                selected
                  ? 'border border-accent bg-accent-soft font-semibold text-ink'
                  : 'font-medium text-subtle hover:text-ink'
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
              {selected && (
                <span
                  className="material-symbols-outlined text-[15px] text-accent"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                  aria-hidden="true"
                >
                  check_circle
                </span>
              )}
              <span className="truncate">{option.label}</span>
            </label>
          )
        })}
      </div>
      <FieldMessage id={messageId} error={error} />
    </fieldset>
  )
}
