import { useEffect, useRef, useState } from 'react'
import { focusTarget, FieldControl } from '../apply/fields'
import { buildPayload, isVisible, normalizeDigits, validateField, validateFields } from '../apply/logic'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import type { Value, Values } from '../content/apply'
import { applyNote, channels, channelsTitle, contactFields, contactForm, contactIntro, faq } from '../content/contact'
import { applyHref, primaryCta } from '../content/site'
import { contactEnabled, submitContact } from './submit'

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'disabled' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string }

const visibleChannels = channels.filter((c) => c.value.trim())

function channelHref(kind: (typeof channels)[number]['kind'], value: string) {
  const v = normalizeDigits(value.trim())
  const digits = v.replace(/\D/g, '')
  if (kind === 'email') return `mailto:${v}`
  // wa.me يقبل الرقم الدولي أرقامًا فقط، دون + أو 00 في أوله.
  if (kind === 'whatsapp') return `https://wa.me/${digits.replace(/^00/, '')}`
  return `tel:${v.startsWith('+') ? '+' : ''}${digits}`
}

export function ContactPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        تخطَّ إلى المحتوى
      </a>
      <Header current="/contact/" />
      <main id="main">
        <section className="contact" aria-labelledby="contact-title">
          <div className="container contact__layout">
            <div className="contact__intro">
              <p className="eyebrow">{contactIntro.eyebrow}</p>
              <h1 id="contact-title" className="contact__title">
                {contactIntro.title}
              </h1>
              <p className="contact__lead">{contactIntro.lead}</p>

              {visibleChannels.length > 0 && (
                <div className="channels">
                  <h2 className="channels__title">{channelsTitle}</h2>
                  <ul>
                    {visibleChannels.map((c) => (
                      <li key={c.kind}>
                        <a className="channel" href={channelHref(c.kind, c.value)}>
                          <span className="channel__icon">
                            <Icon name={c.icon} size={22} />
                          </span>
                          <span className="channel__text">
                            <span className="channel__label">{c.label}</span>
                            <span className="channel__value" dir="ltr">
                              {c.value}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="apply-note">
                <h2 className="apply-note__title">{applyNote.title}</h2>
                <p>{applyNote.text}</p>
                <a className="btn btn--ghost btn--sm" href={applyHref}>
                  {primaryCta}
                  <Icon name="arrowNext" size={18} />
                </a>
              </div>
            </div>

            <ContactForm />
          </div>
        </section>
        <Faq />
      </main>
      <Footer onHome={false} />
    </>
  )
}

/** حالة النموذج في الذاكرة فقط، كاستمارة الطلب: لا localStorage ولا تحليلات. */
function ContactForm() {
  const [values, setValues] = useState<Values>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [announcement, setAnnouncement] = useState('')
  const submitting = useRef(false)
  const statusRef = useRef<HTMLDivElement>(null)

  const dirty = Object.values(values).some((v) => typeof v === 'string' && v.trim()) && status.kind !== 'ok'

  // تنبيه قبل مغادرة الصفحة إن كُتبت رسالة لم تُرسل، لأنها غير محفوظة.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // نقل التركيز إلى نتيجة الإرسال بعد ظهورها، ليسمعها قارئ الشاشة ويراها المستخدم.
  useEffect(() => {
    if (status.kind === 'ok' || status.kind === 'disabled' || status.kind === 'error') statusRef.current?.focus()
  }, [status])

  function focusFirstError(errs: Record<string, string>) {
    const first = contactFields.find((f) => errs[f.id] && isVisible(f, values))
    if (!first) return
    const el = focusTarget(first, values)
    el?.focus({ preventScroll: true })
    el?.closest('.field')?.scrollIntoView({ block: 'center', behavior: 'auto' })
  }

  function handleChange(key: string, value: Value) {
    const next = { ...values, [key]: value }
    setValues(next)
    // كما في استمارة الطلب: يظهر التحقق عند الإرسال، ثم تختفي الرسالة فور تصحيح الحقل.
    setErrors((prev) => {
      const updated: Record<string, string> = {}
      for (const f of contactFields) {
        if (!prev[f.id]) continue
        const e = validateField(f, next)
        if (e) updated[f.id] = e
      }
      return updated
    })
    if (status.kind === 'error') setStatus({ kind: 'idle' })
  }

  async function submit() {
    if (submitting.current) return
    const errs = validateFields(contactFields, values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      setAnnouncement('بعض الحقول تحتاج إلى مراجعة قبل الإرسال.')
      requestAnimationFrame(() => focusFirstError(errs))
      return
    }
    setAnnouncement('')

    submitting.current = true
    setStatus({ kind: 'submitting' })
    const result = await submitContact(buildPayload([], contactFields, values))
    submitting.current = false

    if (result.status === 'invalid') {
      if (contactFields.some((f) => result.fieldErrors[f.id])) {
        setStatus({ kind: 'idle' })
        setErrors(result.fieldErrors)
        requestAnimationFrame(() => focusFirstError(result.fieldErrors))
        return
      }
      setStatus({ kind: 'error', message: 'لم يقبل الخادم بعض البيانات. راجع الرسالة وحاول مرة أخرى.' })
    } else {
      setStatus(result.status === 'error' ? { kind: 'error', message: result.message } : { kind: result.status })
    }
  }

  if (status.kind === 'ok') {
    return (
      <div className="contact-done" ref={statusRef} tabIndex={-1} role="status">
        <Icon name="check" size={32} />
        <h2>{contactForm.done.title}</h2>
        <p>{contactForm.done.text}</p>
        <a className="btn btn--ghost" href="/">
          {contactForm.done.back}
        </a>
      </div>
    )
  }

  return (
    <form
      className="contact-form"
      noValidate
      aria-labelledby="contact-form-title"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <header className="contact-form__head">
        <h2 id="contact-form-title">{contactForm.title}</h2>
        <p>{contactForm.description}</p>
      </header>

      {!contactEnabled && (
        <p className="notice notice--demo notice--compact contact-form__demo">
          <Icon name="info" size={20} />
          <span>{contactForm.demoNotice}</span>
        </p>
      )}

      <div className="field-grid">
        {contactFields
          .filter((f) => isVisible(f, values))
          .map((f) => (
            <FieldControl key={f.id} field={f} values={values} error={errors[f.id]} onChange={handleChange} />
          ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {(status.kind === 'disabled' || status.kind === 'error') && (
        <div className={`notice ${status.kind === 'error' ? 'notice--error' : 'notice--demo'} contact-form__status`} ref={statusRef} tabIndex={-1} role="alert">
          <Icon name={status.kind === 'error' ? 'alert' : 'info'} size={22} />
          <div>
            {status.kind === 'disabled' ? (
              <>
                <strong>لم تُرسل الرسالة.</strong> {contactForm.disabledResult}
              </>
            ) : (
              <>{status.message} رسالتك ما زالت مكتوبة في النموذج.</>
            )}
          </div>
        </div>
      )}

      <div className="contact-form__foot">
        <p className="contact-form__privacy">
          <Icon name="lock" size={18} />
          {contactForm.privacyNote}
        </p>
        <button type="submit" className="btn btn--primary btn--lg" disabled={status.kind === 'submitting'}>
          {status.kind === 'submitting' ? contactForm.submitting : contactForm.submit}
        </button>
      </div>
    </form>
  )
}

function Faq() {
  return (
    <section className="section section--mist faq" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <header className="faq__head">
          <p className="eyebrow">{faq.eyebrow}</p>
          <h2 id="faq-title">{faq.title}</h2>
        </header>
        <div className="faq__list">
          {faq.items.map((item) => (
            <details className="faq__item" key={item.q}>
              <summary>
                <span>{item.q}</span>
                <span className="faq__mark" aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
