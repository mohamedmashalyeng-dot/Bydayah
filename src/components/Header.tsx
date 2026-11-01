import { useEffect, useRef, useState } from 'react'
import { applyHref, homeLink, pages, primaryCta } from '../content/site'
import { OfficialLogo } from './Brand'
import { Icon } from './Icon'

const FOCUSABLE = 'a[href], button:not([disabled])'

/**
 * site: روابط الصفحات (الرئيسية، من نحن، تواصل معنا)، و`current` يعلّم الصفحة الحالية.
 * apply: رابط العودة فقط حتى لا تشتت الاستمارة.
 */
export function Header({ variant = 'site', current }: { variant?: 'site' | 'apply'; current?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 12)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.classList.add('menu-open')
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const close = (returnFocus: boolean) => {
      setOpen(false)
      if (returnFocus) toggleRef.current?.focus()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close(true)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current || !toggleRef.current) return
      // حصر التركيز بين زر القائمة وروابطها ما دامت مفتوحة.
      const items = [toggleRef.current, ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (!items.includes(document.activeElement as HTMLElement)) {
        e.preventDefault()
        first.focus()
      }
    }
    const wide = window.matchMedia('(min-width: 960px)')
    const onWide = () => wide.matches && close(false)

    document.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      root.classList.remove('menu-open')
      document.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  const classes = ['site-header', scrolled && 'is-scrolled', open && 'is-open'].filter(Boolean).join(' ')
  const withMenu = variant === 'site'
  const links = [homeLink, ...pages]
  const isCurrent = (href: string) => (href === current ? 'page' : undefined)

  return (
    <header className={classes}>
      <div className="container site-header__bar">
        <OfficialLogo />

        {withMenu ? (
          <>
            <nav className="site-nav" aria-label="القائمة الرئيسية">
              <ul>
                {links.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} aria-current={isCurrent(item.href)}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <a className="btn btn--primary btn--sm site-header__cta" href={applyHref}>
              {primaryCta}
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? 'close' : 'menu'} />
              <span>{open ? 'إغلاق' : 'القائمة'}</span>
            </button>
          </>
        ) : (
          <a className="link-back" href="/">
            <Icon name="arrowPrev" size={20} />
            العودة إلى الرئيسية
          </a>
        )}
      </div>

      {withMenu && (
        <div id="site-menu" className="mobile-menu" ref={panelRef} hidden={!open}>
          <nav className="container" aria-label="القائمة">
            <ul>
              {links.map((item) => (
                <li key={item.href}>
                  <a href={item.href} aria-current={isCurrent(item.href)} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a className="btn btn--primary btn--block" href={applyHref}>
              {primaryCta}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
