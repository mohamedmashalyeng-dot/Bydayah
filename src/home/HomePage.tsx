import { ArchCta } from '../components/ArchCta'
import { Divider, MotifLines } from '../components/Brand'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { Photo } from '../components/Photo'
import { photos } from '../content/photos'
import {
  applyHref,
  expectations,
  finalCta,
  hero,
  how,
  international,
  intro,
  legal,
  primaryCta,
  privacy,
  stories,
  why,
} from '../content/site'
import { stagger } from '../lib/motion'
import { Journey } from './Journey'

export function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        تخطَّ إلى المحتوى
      </a>
      <Header current="/" />
      <main id="main">
        <Hero />
        <Intro />
        <How />
        <Why />
        <Divider />
        <Stories />
        <International />
        <Privacy />
        <Expectations />
        <ArchCta id="final-title" title={finalCta.title} text={finalCta.text} />
      </main>
      <Footer />
    </>
  )
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__content">
          <p className="eyebrow hero__in" style={stagger(0)}>
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="hero__title hero__in" style={stagger(1)}>
            {hero.titleLines.map((line) => (
              <span key={line}>{line} </span>
            ))}
          </h1>
          <p className="hero__lead hero__in" style={stagger(2)}>
            {hero.lead}
          </p>
          <div className="hero__actions hero__in" style={stagger(3)}>
            <a className="btn btn--primary btn--lg" href={applyHref}>
              {primaryCta}
              <Icon name="arrowNext" size={20} />
            </a>
            <a className="btn btn--ghost btn--lg" href={hero.secondary.href}>
              {hero.secondary.label}
            </a>
          </div>
        </div>
        <Photo
          className="hero__visual"
          photo={photos.hero}
          sizes="(min-width: 1200px) 100vw, (min-width: 960px) 90vw, (min-width: 600px) calc(100vw - 48px), calc((100vw - 40px) * 1.34)"
          priority
        />
      </div>
    </section>
  )
}

function Intro() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <h2 id="intro-title" className="sr-only">
        عن بداية
      </h2>
      <Divider />
      <div className="container intro__grid">
        <p className="intro__statement" data-reveal>
          {intro.statement}
        </p>
        <p className="intro__body" data-reveal style={stagger(1)}>
          {intro.body}
        </p>
      </div>
    </section>
  )
}

function How() {
  return (
    <section id="how" className="section section--mist how" aria-labelledby="how-title">
      <div className="container">
        <header className="section-head" data-reveal>
          <p className="eyebrow">{how.eyebrow}</p>
          <h2 id="how-title">{how.title}</h2>
          <p className="section-lead">{how.lead}</p>
        </header>
        <Journey steps={how.steps} />
        <div className="how__cta" data-reveal>
          <a className="btn btn--primary" href={applyHref}>
            {primaryCta}
            <Icon name="arrowNext" size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}

function Why() {
  return (
    <section id="why" className="section why" aria-labelledby="why-title">
      <div className="container why__grid">
        <div className="why__intro">
          <header className="why__head" data-reveal>
            <p className="eyebrow">{why.eyebrow}</p>
            <h2 id="why-title">{why.title}</h2>
            <p className="section-lead">{why.lead}</p>
          </header>
          <Photo
            className="why__photo"
            photo={photos.why}
            sizes="(min-width: 1280px) 480px, (min-width: 960px) 40vw, calc(100vw - 40px)"
            reveal
          />
        </div>
        <ul className="feature-list">
          {why.features.map((f, i) => (
            <li className="feature" key={f.title} data-reveal style={stagger(i)}>
              <span className="feature__icon">
                <Icon name={f.icon} />
              </span>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__text">{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Stories() {
  return (
    <section className="section stories" aria-labelledby="stories-title">
      <div className="container">
        <header className="section-head section-head--center" data-reveal>
          <p className="eyebrow">{stories.eyebrow}</p>
          <h2 id="stories-title">{stories.title}</h2>
          <p className="section-lead">{stories.lead}</p>
        </header>
        <div className="stories__groups">
          {stories.groups.map((g, i) => (
            <div className="tag-group" key={g.label} data-reveal style={stagger(i)}>
              <h3 className="tag-group__label">{g.label}</h3>
              <ul className="tags">
                {g.items.map((item) => (
                  <li className="tag" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="stories__closing" data-reveal>
          {stories.closing}
        </p>
      </div>
    </section>
  )
}

function International() {
  return (
    <section id="international" className="section section--mist intl" aria-labelledby="intl-title">
      <div className="container intl__grid">
        <div className="intl__text" data-reveal>
          <p className="eyebrow">{international.eyebrow}</p>
          <h2 id="intl-title">{international.title}</h2>
          {international.paragraphs.map((p) => (
            <p className="section-lead" key={p}>
              {p}
            </p>
          ))}
          <a className="btn btn--ghost" href="#legal">
            {international.legalLink}
            <Icon name="arrowDown" size={20} />
          </a>
        </div>
        <Photo
          className="intl__photo"
          photo={photos.international}
          sizes="(min-width: 1280px) 560px, (min-width: 960px) 45vw, calc(100vw - 40px)"
          reveal
        />
        <div className="intl__countries" data-reveal>
          <h3 className="intl__label">
            <Icon name="globe" size={22} />
            {international.countriesLabel}
          </h3>
          <ul className="country-list">
            {international.countries.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="note">{international.countriesNote}</p>
        </div>
      </div>

      <div className="container">
        <section id="legal" className="legal" aria-labelledby="legal-title" data-reveal>
          <div className="legal__head">
            <span className="legal__icon">
              <Icon name="scale" size={28} />
            </span>
            <div>
              <h3 id="legal-title" className="legal__title">
                {legal.title}
              </h3>
              <p className="legal__lead">{legal.lead}</p>
            </div>
          </div>
          <div className="legal__cols">
            {legal.columns.map((col) => (
              <div className="legal__col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function Privacy() {
  return (
    <section id="privacy" className="section section--green privacy" aria-labelledby="privacy-title">
      <MotifLines className="privacy__motif" />
      <div className="container privacy__inner">
        <header className="privacy__head" data-reveal>
          <p className="eyebrow eyebrow--light">{privacy.eyebrow}</p>
          <h2 id="privacy-title">
            {privacy.titleLines.map((line) => (
              <span key={line}>{line} </span>
            ))}
          </h2>
          <p className="section-lead">{privacy.lead}</p>
        </header>
        <ul className="privacy__points">
          {privacy.points.map((p, i) => (
            <li className="privacy__point" key={p.title} data-reveal style={stagger(i)}>
              <Icon name={p.icon} size={26} />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Expectations() {
  return (
    <section className="section expect" aria-labelledby="expect-title">
      <div className="container">
        <div className="expect__head" data-reveal>
          <p className="eyebrow">{expectations.eyebrow}</p>
          <h2 id="expect-title" className="expect__statement">
            {expectations.statement}
          </h2>
          <p className="section-lead">{expectations.lead}</p>
        </div>
        <ul className="commitments">
          {expectations.commitments.map((c, i) => (
            <li className="commitment" key={c.title} data-reveal style={stagger(i)}>
              <Icon name={c.icon} />
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
