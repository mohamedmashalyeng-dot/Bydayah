import { ArchCta } from '../components/ArchCta'
import { Divider, HeroArt } from '../components/Brand'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { Photo } from '../components/Photo'
import { aboutCta, aboutHero, aboutIdentity, aboutPurpose, aboutStory, aboutValues } from '../content/about'
import { photos } from '../content/photos'
import { stagger } from '../lib/motion'

export function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        تخطَّ إلى المحتوى
      </a>
      <Header current="/about/" />
      <main id="main">
        <Hero />
        <Story />
        <Purpose />
        <Values />
        <Identity />
        <ArchCta id="about-cta-title" title={aboutCta.title} text={aboutCta.text} secondary={aboutCta.secondary} />
      </main>
      <Footer onHome={false} />
    </>
  )
}

function Hero() {
  return (
    <section className="page-hero" aria-labelledby="about-title">
      <div className="container page-hero__grid">
        <div>
          <p className="eyebrow page-hero__in" style={stagger(0)}>
            {aboutHero.eyebrow}
          </p>
          <h1 id="about-title" className="page-hero__title page-hero__in" style={stagger(1)}>
            {aboutHero.titleLines.map((line) => (
              <span key={line}>{line} </span>
            ))}
          </h1>
          <p className="page-hero__lead page-hero__in" style={stagger(2)}>
            {aboutHero.lead}
          </p>
        </div>
        <div className="page-hero__visual">
          <HeroArt />
        </div>
      </div>
    </section>
  )
}

function Story() {
  return (
    <section className="about-story" aria-labelledby="story-title">
      <Divider />
      <div className="container about-story__grid">
        <div data-reveal>
          <h2 id="story-title" className="eyebrow">
            {aboutStory.title}
          </h2>
          <p className="about-story__statement">{aboutStory.statement}</p>
        </div>
        <div className="about-story__body" data-reveal style={stagger(1)}>
          {aboutStory.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

function Purpose() {
  return (
    <section className="section section--mist purpose" aria-labelledby="purpose-title">
      <h2 id="purpose-title" className="sr-only">
        رسالتنا ورؤيتنا
      </h2>
      <div className="container purpose__layout">
        <Photo
          className="purpose__photo"
          photo={photos.about}
          sizes="(min-width: 1280px) 480px, (min-width: 960px) 40vw, calc(100vw - 40px)"
          reveal
        />
        <div className="purpose__grid">
          {aboutPurpose.map((item, i) => (
            <div className="purpose__item" key={item.label} data-reveal style={stagger(i)}>
              <h3 className="purpose__label">{item.label}</h3>
              <p className="purpose__text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Values() {
  return (
    <section className="section values" aria-labelledby="values-title">
      {/* العنوان يشغل الخانة الأولى من شبكة القيم على الشاشات الواسعة */}
      <div className="container values__grid">
        <header className="values__head" data-reveal>
          <p className="eyebrow">{aboutValues.eyebrow}</p>
          <h2 id="values-title">{aboutValues.title}</h2>
          <p className="section-lead">{aboutValues.lead}</p>
        </header>
        <ul className="values__list">
          {aboutValues.items.map((v, i) => (
            <li className="value" key={v.title} data-reveal style={stagger(i + 1)}>
              <span className="value__icon">
                <Icon name={v.icon} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Identity() {
  const columns = [
    { ...aboutIdentity.is, icon: 'check' as const, tone: 'is' },
    { ...aboutIdentity.isNot, icon: 'close' as const, tone: 'not' },
  ]
  return (
    <section className="section section--green identity" aria-labelledby="identity-title">
      <div className="container">
        <header className="section-head" data-reveal>
          <p className="eyebrow eyebrow--light">{aboutIdentity.eyebrow}</p>
          <h2 id="identity-title">{aboutIdentity.title}</h2>
        </header>
        <div className="identity__cols">
          {columns.map((col, i) => (
            <div className={`identity__col identity__col--${col.tone}`} key={col.title} data-reveal style={stagger(i)}>
              <h3>{col.title}</h3>
              <ul>
                {col.items.map((item) => (
                  <li key={item}>
                    <Icon name={col.icon} size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
