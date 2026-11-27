import { FieldMessage, OptionalMark, RequiredMark, labelClass } from './FieldShell.jsx'
import { choiceClass } from './fieldStyles.js'

// 라디오 묶음. 선택하면 앰버 테두리 + 샴페인 바탕. columns 로 한 줄 개수를 정한다.
// stacked: 한 줄에 하나씩, '이름 (설명)' 형식의 label 은 이름과 설명을 나눠 보여준다.
export default function SegmentedField({
  name,
  label,
  options,
  required = false,
  optional = false,
  columns = 2,
  stacked = false,
  hint,
  value,
  error,
  onChange,
}) {
  const messageId = `${name}-message`
  const gridClass = stacked ? 'flex flex-col gap-2' : `grid gap-2 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className={`${labelClass} mb-2 p-0`}>
        {label}
        {required && <RequiredMark />}
        {optional && <OptionalMark />}
      </legend>
      <div className={gridClass}>
        {options.map((option, index) => {
          const selected = value === option.value
          const [main, sub] = stacked ? option.label.split(/ \((.+)\)$/) : [option.label]
          return (
            <label
              key={option.value === '' ? '__empty' : option.value}
              className={`${choiceClass(selected, error)} ${stacked ? 'justify-between gap-3 px-[18px] py-2.5 text-left' : ''}`}
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
                aria-describedby={error || hint ? messageId : undefined}
                className="sr-only"
              />
              <span>{main}</span>
              {sub && <span className="text-[13px] font-normal opacity-85">{sub}</span>}
            </label>
          )
        })}
      </div>
      <FieldMessage id={messageId} hint={hint} error={error} />
    </fieldset>
  )
}
