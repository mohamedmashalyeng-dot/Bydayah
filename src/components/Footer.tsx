import { applyHref, brand, footer, nav, pages, primaryCta } from '../content/site'
import { BrandMark } from './Brand'

/** روابط الأقسام خارج الصفحة الرئيسية تعود إليها. */
export function Footer({ onHome = true }: { onHome?: boolean }) {
  const prefix = onHome ? '' : '/'
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <a className="logo logo--light" href="/">
            <BrandMark size={34} />
            <span className="logo__text">
              <span className="logo__ar">{brand.nameAr}</span>
              <span className="logo__en" lang="en" dir="ltr">
                {brand.nameEn}
              </span>
            </span>
            <span className="sr-only"> — الصفحة الرئيسية</span>
          </a>
          <p className="site-footer__tagline">{brand.tagline}</p>
        </div>

        <nav className="site-footer__nav" aria-label={footer.linksTitle}>
          <h2 className="site-footer__title">{footer.linksTitle}</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={`${prefix}${item.href}`}>{item.label}</a>
              </li>
            ))}
            {pages.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href={applyHref}>{primaryCta}</a>
            </li>
          </ul>
        </nav>

        <p className="site-footer__disclaimer">{footer.disclaimer}</p>
      </div>
      <div className="container site-footer__bottom">
        <p>
          © {footer.year} {brand.nameAr} | <span lang="en">{brand.nameEn}</span>
        </p>
      </div>
    </footer>
  )
}
