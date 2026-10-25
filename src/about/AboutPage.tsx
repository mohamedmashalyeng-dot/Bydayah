import { ArchCta } from '../components/ArchCta'
import { Divider, HeroArt } from '../components/Brand'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { Photo } from '../components/Photo'
import { aboutCta, aboutFeatures, aboutHero, aboutPurpose, aboutStory } from '../content/about'
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
        <Features />
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
        رؤيتنا ورسالتنا
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

function Features() {
  return (
    <section className="section features" aria-labelledby="features-title">
      <div className="container">
        <header className="section-head" data-reveal>
          <p className="eyebrow">{aboutFeatures.eyebrow}</p>
          <h2 id="features-title">{aboutFeatures.title}</h2>
        </header>
        <ul className="features__list">
          {aboutFeatures.items.map((f, i) => (
            <li className="feature" key={f.title} data-reveal style={stagger(i)}>
              <span className="feature__icon">
                <Icon name={f.icon} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
