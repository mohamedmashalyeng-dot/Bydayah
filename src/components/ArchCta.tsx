import { applyHref, primaryCta } from '../content/site'
import { Icon } from './Icon'

type Props = {
  id: string
  title: string
  text: string
  secondary?: { label: string; href: string }
}

/** الدعوة الختامية: نص داخل قوس من مسارين، تنتهي بزر بدء الطلب. */
export function ArchCta({ id, title, text, secondary }: Props) {
  return (
    <section className="section section--mist final" aria-labelledby={id}>
      <div className="container">
        <div className="arch" data-reveal>
          <div className="arch__frame" aria-hidden="true">
            <span className="arch__half arch__half--a" />
            <span className="arch__half arch__half--b" />
            <span className="arch__dot" />
          </div>
          <div className="arch__content">
            <h2 id={id}>{title}</h2>
            <p>{text}</p>
            <div className="arch__actions">
              <a className="btn btn--primary btn--lg" href={applyHref}>
                {primaryCta}
                <Icon name="arrowNext" size={20} />
              </a>
              {secondary && (
                <a className="btn btn--ghost btn--lg" href={secondary.href}>
                  {secondary.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
