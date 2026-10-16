import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { consentField, privacyDraft, steps, type Field, type Value, type Values } from '../content/apply'
import { FieldControl, focusTarget } from './fields'
import { buildPayload, displayValue, isVisible, validateField, validateFields } from './logic'
import { submissionEnabled, submitApplication } from './submit'

const LAST = steps.length - 1
const stepFields = (i: number): Field[] => (i === LAST ? [...steps[i].fields, consentField] : steps[i].fields)

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'disabled' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string }

/*
 * حالة الاستمارة في الذاكرة فقط: لا localStorage، ولا تحليلات، ولا سجلات console.
 * تُفقد الإجابات عند إغلاق الصفحة أو تحديثها، وهذا موضح للمستخدم.
 */
export function ApplyPage() {
  const [index, setIndex] = useState(0)
  const [reached, setReached] = useState(0)
  const [values, setValues] = useState<Values>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState<'fwd' | 'back' | null>(null)
  const [returnToReview, setReturnToReview] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [announcement, setAnnouncement] = useState('')

  const submitting = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const focusErrorAfterRender = useRef<Record<string, string> | null>(null)

  const step = steps[index]
  const fields = stepFields(index)
  const isLast = index === LAST
  const dirty = Object.keys(values).length > 0 && status.kind !== 'ok'

  // تنبيه قبل مغادرة الصفحة إن وُجدت إجابات لم تُرسل، لأنها غير محفوظة.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // بعد الانتقال بين الخطوات: تمرير هادئ إلى أعلى الخطوة عند الحاجة فقط، ثم نقل التركيز.
  useEffect(() => {
    if (direction === null) return
    const panel = panelRef.current
    if (panel) {
      const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
      const top = panel.getBoundingClientRect().top
      if (top < header + 8 || top > window.innerHeight * 0.6) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: window.scrollY + top - header - 16, behavior: reduce ? 'auto' : 'smooth' })
      }
    }
    const pending = focusErrorAfterRender.current
    focusErrorAfterRender.current = null
    if (pending) focusFirstError(stepFields(index), pending)
    else headingRef.current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, direction])

  function focusFirstError(list: Field[], errs: Record<string, string>) {
    const first = list.find((f) => errs[f.id])
    if (!first) return
    const el = focusTarget(first, values)
    el?.focus({ preventScroll: true })
    el?.closest('.field')?.scrollIntoView({ block: 'center', behavior: 'auto' })
  }

  function goTo(target: number, dir: 'fwd' | 'back') {
    setErrors({})
    setDirection(dir)
    setIndex(target)
    setReached((r) => Math.max(r, target))
  }

  function handleChange(key: string, value: Value) {
    const next = { ...values, [key]: value }
    setValues(next)
    // يظهر التحقق عند «التالي» أو «إرسال» فقط، لا عند مغادرة الحقل، حتى لا تُزيح الرسائل
    // المفاجئة العناصر أثناء النقر. هنا يُعاد التحقق من الحقول التي تعرض خطأً فتختفي الرسالة فور التصحيح.
    setErrors((prev) => {
      const updated: Record<string, string> = {}
      for (const f of fields) {
        if (!prev[f.id]) continue
        const e = validateField(f, next)
        if (e) updated[f.id] = e
      }
      return updated
    })
    if (status.kind === 'error') setStatus({ kind: 'idle' })
  }

  function validateCurrent() {
    const errs = validateFields(fields, values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      setAnnouncement('بعض الإجابات تحتاج إلى مراجعة قبل المتابعة.')
      requestAnimationFrame(() => focusFirstError(fields, errs))
      return false
    }
    setAnnouncement('')
    return true
  }

  function next() {
    if (!validateCurrent()) return
    const target = returnToReview ? LAST : index + 1
    setReturnToReview(false)
    goTo(target, 'fwd')
  }

  function prev() {
    setReturnToReview(false)
    goTo(index - 1, 'back')
  }

  function jump(target: number) {
    if (target === index) return
    if (target > index && !validateCurrent()) return
    setReturnToReview(false)
    goTo(target, target > index ? 'fwd' : 'back')
  }

  function editFromReview(target: number) {
    setReturnToReview(true)
    goTo(target, 'back')
  }

  async function submit() {
    if (submitting.current || status.kind === 'ok') return

    for (let i = 0; i <= LAST; i++) {
      const errs = validateFields(stepFields(i), values)
      if (!Object.keys(errs).length) continue
      if (i === index) {
        setErrors(errs)
        setAnnouncement('بعض الإجابات تحتاج إلى مراجعة قبل الإرسال.')
        requestAnimationFrame(() => focusFirstError(fields, errs))
      } else {
        focusErrorAfterRender.current = errs
        goTo(i, 'back')
        setErrors(errs)
      }
      return
    }

    submitting.current = true
    setStatus({ kind: 'submitting' })
    const result = await submitApplication(buildPayload(steps, [consentField], values))
    submitting.current = false

    if (result.status === 'invalid') {
      const target = steps.findIndex((_, i) => stepFields(i).some((f) => result.fieldErrors[f.id]))
      setStatus({ kind: 'idle' })
      if (target === -1) {
        setStatus({ kind: 'error', message: 'لم يقبل الخادم بعض الإجابات. راجع الاستمارة وحاول مرة أخرى.' })
      } else if (target === index) {
        setErrors(result.fieldErrors)
        requestAnimationFrame(() => focusFirstError(fields, result.fieldErrors))
      } else {
        focusErrorAfterRender.current = result.fieldErrors
        goTo(target, 'back')
        setErrors(result.fieldErrors)
      }
      return
    }

    setStatus(result.status === 'error' ? { kind: 'error', message: result.message } : { kind: result.status })
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  if (status.kind === 'ok') {
    return (
      <Shell>
        <div className="apply-done" ref={statusRef} tabIndex={-1} role="status">
          <Icon name="check" size={32} />
          <h2>وصل طلبك إلى فريق بداية</h2>
          <p>سيراجع الفريق طلبك ويتواصل معك عبر الوسيلة التي اخترتها. لن تُشارك بيانات تواصلك مع أي طرف دون موافقتك.</p>
          <a className="btn btn--ghost" href="/">
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </Shell>
    )
  }

  return (
    <Shell
      aside={
        <nav className="stepper" aria-label="خطوات الطلب">
          <ol>
            {steps.map((s, i) => {
              const state = i === index ? 'current' : i < index || i <= reached ? 'done' : 'todo'
              return (
                <li key={s.id} className={`stepper__item is-${state}`}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    disabled={i > reached}
                    aria-current={i === index ? 'step' : undefined}
                  >
                    <span className="stepper__num" aria-hidden="true">
                      {i < index || (i <= reached && i !== index) ? <Icon name="check" size={16} /> : i + 1}
                    </span>
                    <span className="stepper__title">{s.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      }
    >
      <div className="progress" aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s.id} className={i < index ? 'is-done' : i === index ? 'is-current' : undefined} />
        ))}
      </div>

      <form
        id="apply-form"
        className="apply-form"
        noValidate
        aria-labelledby="step-title"
        onSubmit={(e) => {
          e.preventDefault()
          if (isLast) submit()
          else next()
        }}
      >
        <div className={`step${direction ? ` step--${direction}` : ''}`} key={index} ref={panelRef}>
          <header className="step__head">
            <p className="step__count">
              الخطوة {index + 1} من {steps.length}
            </p>
            <h2 id="step-title" ref={headingRef} tabIndex={-1}>
              {step.title}
            </h2>
            <p className="step__desc">{step.description}</p>
          </header>

          <div className="field-grid">
            {step.fields
              .filter((f) => isVisible(f, values))
              .map((f) => (
                <FieldControl key={f.id} field={f} values={values} error={errors[f.id]} onChange={handleChange} />
              ))}
          </div>

          {isLast && (
            <>
              <Review values={values} onEdit={editFromReview} />
              <details className="policy-draft">
                <summary>
                  {privacyDraft.title}
                  <span className="badge">{privacyDraft.badge}</span>
                </summary>
                <ul>
                  {privacyDraft.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p className="policy-draft__note">{privacyDraft.note}</p>
              </details>
              <FieldControl field={consentField} values={values} error={errors[consentField.id]} onChange={handleChange} />
            </>
          )}

          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>

          {(status.kind === 'disabled' || status.kind === 'error') && (
            <div className={`notice ${status.kind === 'error' ? 'notice--error' : 'notice--demo'}`} ref={statusRef} tabIndex={-1} role="alert">
              <Icon name={status.kind === 'error' ? 'alert' : 'info'} size={22} />
              <div>
                {status.kind === 'disabled' ? (
                  <>
                    <strong>لم يُرسل الطلب.</strong> استقبال الطلبات غير مفعّل في هذه النسخة التجريبية من الموقع، ولم تُحفظ إجاباتك
                    أو تُرسل إلى أي جهة.
                  </>
                ) : (
                  <>
                    {status.message} إجاباتك ما زالت موجودة في هذه الصفحة.
                  </>
                )}
              </div>
            </div>
          )}

          <div className="step__nav">
            {index > 0 && (
              <button type="button" className="btn btn--ghost btn--lg" onClick={prev}>
                <Icon name="arrowPrev" size={20} />
                السابق
              </button>
            )}
            {isLast ? (
              <button type="submit" className="btn btn--primary btn--lg" disabled={status.kind === 'submitting'}>
                {status.kind === 'submitting' ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
              </button>
            ) : (
              <button type="submit" className="btn btn--primary btn--lg">
                {returnToReview ? 'حفظ والعودة إلى المراجعة' : 'التالي'}
                <Icon name="arrowNext" size={20} />
              </button>
            )}
          </div>
        </div>
      </form>
    </Shell>
  )
}

function Shell({ aside, children }: { aside?: ReactNode; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#apply-main">
        تخطَّ إلى الاستمارة
      </a>
      <Header variant="apply" />
      <main className="apply">
        <div className="container apply__layout">
          <aside className="apply__aside">
            <p className="eyebrow">طلب خاص وسري</p>
            <h1 className="apply__title">ابدأ طلب الزواج</h1>
            <p className="apply__intro">
              ثماني خطوات قصيرة. تبقى إجاباتك في هذه الصفحة فقط أثناء التعبئة، وتُفقد إذا أغلقتها أو حدّثتها. الحقول المعلّمة بـ«مطلوب»
              ضرورية، وباقي الحقول اختيارية.
            </p>
            {!submissionEnabled && (
              <p className="notice notice--demo notice--compact">
                <Icon name="info" size={20} />
                <span>نسخة تجريبية: استقبال الطلبات غير مفعّل حاليًا، ولن تُرسل إجاباتك أو تُحفظ.</span>
              </p>
            )}
            {aside}
          </aside>
          <div className="apply__main" id="apply-main" tabIndex={-1}>
            {children}
          </div>
        </div>
      </main>
      <Footer onHome={false} />
    </>
  )
}

function Review({ values, onEdit }: { values: Values; onEdit: (i: number) => void }) {
  return (
    <section className="review" aria-labelledby="review-title">
      <h3 id="review-title" className="review__title">
        مراجعة إجاباتك
      </h3>
      <p className="review__lead">راجع إجاباتك قبل الإرسال. عند تعديل أي مجموعة ستعود إلى هنا مباشرة.</p>
      {steps.slice(0, LAST).map((s, i) => (
        <div className="review__group" key={s.id}>
          <div className="review__head">
            <h4>{s.title}</h4>
            <button type="button" className="link-btn" onClick={() => onEdit(i)}>
              <Icon name="edit" size={18} />
              تعديل<span className="sr-only"> {s.title}</span>
            </button>
          </div>
          <dl>
            {s.fields
              .filter((f) => isVisible(f, values))
              .map((f) => {
                const v = displayValue(f, values)
                return (
                  <div className="review__row" key={f.id}>
                    <dt>{f.label}</dt>
                    <dd className={v ? undefined : 'is-empty'}>{v ? <bdi>{v}</bdi> : 'لم تتم الإجابة'}</dd>
                  </div>
                )
              })}
          </dl>
        </div>
      ))}
    </section>
  )
}
