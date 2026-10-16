import type { Field, Value, Values } from '../content/apply'
import { Icon } from '../components/Icon'
import { isRequired, maxKey, minKey, visibleOptions } from './logic'

type Props = {
  field: Field
  values: Values
  error?: string
  onChange: (id: string, value: Value) => void
}

export const domId = (id: string) => `f-${id}`

/** العنصر الذي يستقبل التركيز عند وجود خطأ في الحقل. */
export function focusTarget(field: Field, values: Values): HTMLElement | null {
  if (field.type === 'ageRange') return document.getElementById(domId(minKey(field.id)))
  if (field.type === 'radio' || field.type === 'checkboxes') {
    const opts = visibleOptions(field.options, values)
    const checked = opts.findIndex((o) => (Array.isArray(values[field.id]) ? (values[field.id] as string[]).includes(o.value) : values[field.id] === o.value))
    return document.getElementById(domId(`${field.id}-${Math.max(checked, 0)}`))
  }
  return document.getElementById(domId(field.id))
}

function Label({ field, values, htmlFor, as = 'label' }: { field: Field; values: Values; htmlFor?: string; as?: 'label' | 'legend' }) {
  const Tag = as
  return (
    <Tag className="field__label" htmlFor={as === 'label' ? htmlFor : undefined}>
      {field.label}
      {isRequired(field, values) ? <span className="field__req">مطلوب</span> : <span className="field__opt">اختياري</span>}
    </Tag>
  )
}

function Help({ field, error }: { field: Field; error?: string }) {
  const id = domId(field.id)
  return (
    <>
      {field.hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {field.hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="alert" size={18} />
          {error}
        </p>
      )}
    </>
  )
}

const describedBy = (field: Field, error?: string) =>
  [field.hint && `${domId(field.id)}-hint`, error && `${domId(field.id)}-error`].filter(Boolean).join(' ') || undefined

export function FieldControl({ field, values, error, onChange }: Props) {
  const id = domId(field.id)
  const required = isRequired(field, values)
  const classes = ['field', field.half && 'field--half', error && 'has-error'].filter(Boolean).join(' ')
  const common = {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(field, error),
    'aria-required': required || undefined,
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number': {
      const isNum = field.type === 'number'
      return (
        <div className={classes}>
          <Label field={field} values={values} htmlFor={id} />
          <Help field={field} error={error} />
          <input
            id={id}
            name={field.id}
            className={isNum ? 'input input--short' : 'input'}
            type={field.type === 'number' ? 'text' : field.type}
            inputMode={isNum ? 'numeric' : field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : undefined}
            dir={field.type === 'email' || field.type === 'tel' ? 'ltr' : undefined}
            autoComplete={'autoComplete' in field ? field.autoComplete : 'off'}
            maxLength={'maxLength' in field ? field.maxLength : isNum ? 3 : undefined}
            value={(values[field.id] as string) ?? ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            {...common}
          />
        </div>
      )
    }

    case 'textarea':
      return (
        <div className={classes}>
          <Label field={field} values={values} htmlFor={id} />
          <Help field={field} error={error} />
          <textarea
            id={id}
            name={field.id}
            className="input input--area"
            rows={field.rows ?? 3}
            maxLength={field.maxLength}
            value={(values[field.id] as string) ?? ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            {...common}
          />
        </div>
      )

    case 'select':
      return (
        <div className={classes}>
          <Label field={field} values={values} htmlFor={id} />
          <Help field={field} error={error} />
          <select
            id={id}
            name={field.id}
            className="input select"
            value={(values[field.id] as string) ?? ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            {...common}
          >
            <option value="">{field.placeholder ?? 'اختر…'}</option>
            {visibleOptions(field.options, values).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )

    case 'radio':
    case 'checkboxes': {
      const multi = field.type === 'checkboxes'
      const current = values[field.id]
      const picked = multi ? (Array.isArray(current) ? current : []) : []
      return (
        <fieldset className={classes} aria-describedby={describedBy(field, error)}>
          <Label field={field} values={values} as="legend" />
          <Help field={field} error={error} />
          <div className={`choices${field.columns === 2 ? ' choices--2' : ''}`}>
            {visibleOptions(field.options, values).map((o, i) => {
              const optId = domId(`${field.id}-${i}`)
              const checked = multi ? picked.includes(o.value) : current === o.value
              return (
                <label className="choice" key={o.value} htmlFor={optId}>
                  <input
                    id={optId}
                    type={multi ? 'checkbox' : 'radio'}
                    name={field.id}
                    value={o.value}
                    checked={checked}
                    aria-invalid={error ? true : undefined}
                    onChange={(e) => {
                      if (!multi) return onChange(field.id, o.value)
                      onChange(field.id, e.target.checked ? [...picked, o.value] : picked.filter((x) => x !== o.value))
                    }}
                  />
                  <span>{o.label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )
    }

    case 'ageRange': {
      const lo = (values[minKey(field.id)] as string) ?? ''
      const hi = (values[maxKey(field.id)] as string) ?? ''
      const ages = Array.from({ length: field.max - field.min + 1 }, (_, i) => String(field.min + i))
      return (
        <fieldset className={classes} aria-describedby={describedBy(field, error)}>
          <Label field={field} values={values} as="legend" />
          <Help field={field} error={error} />
          <div className="range">
            <div className="range__part">
              <label htmlFor={domId(minKey(field.id))}>من</label>
              <select
                id={domId(minKey(field.id))}
                className="input select"
                value={lo}
                onChange={(e) => onChange(minKey(field.id), e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(field, error)}
              >
                <option value="">—</option>
                {/* لا يُعرض حد أدنى أكبر من الحد الأقصى المختار */}
                {ages.map((a) => (
                  <option key={a} value={a} disabled={hi !== '' && Number(a) > Number(hi)}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <span className="range__sep" aria-hidden="true" />
            <div className="range__part">
              <label htmlFor={domId(maxKey(field.id))}>إلى</label>
              <select
                id={domId(maxKey(field.id))}
                className="input select"
                value={hi}
                onChange={(e) => onChange(maxKey(field.id), e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(field, error)}
              >
                <option value="">—</option>
                {ages.map((a) => (
                  <option key={a} value={a} disabled={lo !== '' && Number(a) < Number(lo)}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <span className="range__unit">سنة</span>
          </div>
        </fieldset>
      )
    }

    case 'consent':
      return (
        <div className={`${classes} field--consent`}>
          <label className="consent" htmlFor={id}>
            <input
              id={id}
              type="checkbox"
              name={field.id}
              checked={values[field.id] === true}
              onChange={(e) => onChange(field.id, e.target.checked)}
              {...common}
            />
            <span>
              {field.label} <span className="field__req">مطلوب</span>
            </span>
          </label>
          <Help field={{ ...field, hint: undefined }} error={error} />
        </div>
      )
  }
}
