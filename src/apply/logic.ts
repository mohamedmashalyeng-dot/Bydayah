import type { Field, Option, Step, Values } from '../content/apply'

/** تحويل الأرقام العربية-الهندية والفارسية إلى أرقام لاتينية قبل التحقق. */
export function normalizeDigits(s: string) {
  return s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
}

export const isVisible = (field: Field, values: Values) => !field.showIf || field.showIf(values)

export const visibleOptions = (options: Option[], values: Values) => options.filter((o) => !o.showIf || o.showIf(values))

export const isRequired = (field: Field, values: Values) => Boolean(field.required || field.requiredIf?.(values))

export const minKey = (id: string) => `${id}_min`
export const maxKey = (id: string) => `${id}_max`

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** يعيد رسالة الخطأ العربية للحقل، أو null إن كان صحيحًا. الحقول المخفية لا تُتحقق. */
export function validateField(field: Field, values: Values): string | null {
  if (!isVisible(field, values)) return null
  const required = isRequired(field, values)
  const raw = values[field.id]

  switch (field.type) {
    case 'text':
    case 'textarea': {
      const v = str(raw)
      if (!v) return required ? `يرجى كتابة ${field.label.replace(/^اكتب /, '')}.` : null
      if (field.maxLength && v.length > field.maxLength) return `الحد الأقصى ${field.maxLength} حرفًا.`
      return null
    }
    case 'email': {
      const v = str(raw)
      if (!v) return required ? 'يرجى كتابة بريدك الإلكتروني، لأنك اخترته وسيلةً للتواصل.' : null
      return EMAIL.test(v) ? null : 'يرجى كتابة بريد إلكتروني صحيح، مثل name@example.com.'
    }
    case 'tel': {
      const v = normalizeDigits(str(raw))
      if (!v) return required ? 'يرجى كتابة رقم الهاتف.' : null
      const digits = v.replace(/\D/g, '')
      const shapeOk = /^\+?[\d\s\-()]+$/.test(v)
      return shapeOk && digits.length >= 8 && digits.length <= 15 ? null : 'يرجى كتابة رقم هاتف صحيح مع رمز الدولة، بالأرقام فقط.'
    }
    case 'number': {
      const v = normalizeDigits(str(raw))
      if (!v) return required ? `يرجى كتابة ${field.label}.` : null
      const n = Number(v)
      if (!/^\d+$/.test(v) || n < field.min || n > field.max) return `يرجى كتابة عمر بين ${field.min} و${field.max} سنة.`
      return null
    }
    case 'select':
    case 'radio': {
      const v = str(raw)
      const valid = visibleOptions(field.options, values).some((o) => o.value === v)
      if (!valid) return required || v ? 'يرجى اختيار إجابة.' : null
      return null
    }
    case 'checkboxes': {
      const allowed = new Set(visibleOptions(field.options, values).map((o) => o.value))
      const picked = Array.isArray(raw) ? raw.filter((x) => allowed.has(x)) : []
      return required && picked.length === 0 ? 'يرجى اختيار إجابة واحدة على الأقل.' : null
    }
    case 'ageRange': {
      const lo = str(values[minKey(field.id)])
      const hi = str(values[maxKey(field.id)])
      if (!lo || !hi) return required || lo || hi ? 'يرجى تحديد الحد الأدنى والحد الأقصى للعمر.' : null
      return Number(lo) > Number(hi) ? 'يجب أن يكون الحد الأقصى للعمر مساويًا للحد الأدنى أو أكبر منه.' : null
    }
    case 'consent':
      return raw === true ? null : 'يلزم الموافقة على الإقرار لإرسال الطلب.'
  }
}

export function validateFields(fields: Field[], values: Values) {
  const errors: Record<string, string> = {}
  for (const f of fields) {
    const e = validateField(f, values)
    if (e) errors[f.id] = e
  }
  return errors
}

/** نص العرض في صفحة المراجعة؛ يعيد null للحقول غير المجاب عنها. */
export function displayValue(field: Field, values: Values): string | null {
  const raw = values[field.id]
  switch (field.type) {
    case 'select':
    case 'radio':
      return visibleOptions(field.options, values).find((o) => o.value === raw)?.label ?? null
    case 'checkboxes': {
      if (!Array.isArray(raw)) return null
      const labels = visibleOptions(field.options, values)
        .filter((o) => raw.includes(o.value))
        .map((o) => o.label)
      return labels.length ? labels.join('، ') : null
    }
    case 'ageRange': {
      const lo = str(values[minKey(field.id)])
      const hi = str(values[maxKey(field.id)])
      return lo && hi ? `من ${lo} إلى ${hi} سنة` : null
    }
    case 'consent':
      return raw === true ? 'تمت الموافقة' : null
    default:
      return str(raw) || null
  }
}

/** نسخة مقروءة من الإجابات لرسالة البريد: السؤال وإجابته كما في صفحة المراجعة. */
function buildSummary(steps: Step[], extra: Field[], values: Values) {
  return [...steps, { title: '', fields: extra }]
    .map(({ title, fields }) => ({
      title,
      rows: fields.flatMap((field) => {
        const value = isVisible(field, values) ? displayValue(field, values) : null
        return value ? [{ label: field.label, value }] : []
      }),
    }))
    .filter((group) => group.rows.length > 0)
}

/**
 * يبني بيانات الإرسال من الحقول الظاهرة فقط، فلا تُرسل إجابات حقول أُخفيت
 * بعد تغيير اختيار سابق (مثل تفاصيل الأبناء بعد اختيار «لا»).
 */
export function buildPayload(steps: Step[], extra: Field[], values: Values) {
  const answers: Record<string, string | string[] | boolean | { min: number; max: number }> = {}
  for (const field of [...steps.flatMap((s) => s.fields), ...extra]) {
    if (!isVisible(field, values)) continue
    const raw = values[field.id]
    if (field.type === 'ageRange') {
      const lo = str(values[minKey(field.id)])
      const hi = str(values[maxKey(field.id)])
      if (lo && hi) answers[field.id] = { min: Number(lo), max: Number(hi) }
    } else if (field.type === 'checkboxes') {
      const allowed = new Set(visibleOptions(field.options, values).map((o) => o.value))
      const picked = Array.isArray(raw) ? raw.filter((x) => allowed.has(x)) : []
      if (picked.length) answers[field.id] = picked
    } else if (field.type === 'consent') {
      answers[field.id] = raw === true
    } else if (field.type === 'tel' || field.type === 'number') {
      const v = normalizeDigits(str(raw))
      if (v) answers[field.id] = v
    } else if (field.type === 'select' || field.type === 'radio') {
      if (displayValue(field, values) !== null) answers[field.id] = raw as string
    } else {
      const v = str(raw)
      if (v) answers[field.id] = v
    }
  }
  return { formVersion: 1, answers, summary: buildSummary(steps, extra, values) }
}
