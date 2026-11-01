import { applyHref, brand, footer, nav, pages, primaryCta, socialLinks } from '../content/site'
import { Logo } from './Brand'
import { Icon } from './Icon'

const visibleSocial = socialLinks.filter((s) => s.href.trim())

/** روابط الأقسام خارج الصفحة الرئيسية تعود إليها. */
export function Footer({ onHome = true }: { onHome?: boolean }) {
  const prefix = onHome ? '' : '/'
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo tone="light" lockup />
          <p className="site-footer__tagline">{brand.tagline}</p>
          {visibleSocial.length > 0 && (
            <ul className="site-footer__social" aria-label={footer.socialTitle}>
              {visibleSocial.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    <Icon name={s.icon} size={22} />
                  </a>
                </li>
              ))}
            </ul>
          )}
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

        <div className="site-footer__disclaimer">
          <h2 className="site-footer__title">{footer.disclaimerTitle}</h2>
          <p>{footer.disclaimer}</p>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <p>
          © {footer.year} {brand.nameAr} | <span lang="en">{brand.nameEn}</span>
        </p>
      </div>
    </footer>
  )
}
