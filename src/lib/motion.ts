import type { CSSProperties } from 'react'

/** ترتيب العنصر ضمن تتابع الظهور؛ يحوّله CSS إلى تأخير بفواصل ثابتة. */
export const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * يُظهر العناصر المعلّمة بـ data-reveal عند دخولها الشاشة مرة واحدة.
 * الإخفاء الأولي مشروط بالصنف motion على <html>، فلا يختفي أي محتوى إن
 * تعطّل هذا السكربت أو طلب المستخدم تقليل الحركة.
 */
export function startReveal() {
  const root = document.documentElement
  ;(window as Window & { __bidayahReady?: boolean }).__bidayahReady = true
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!root.classList.contains('motion') || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.setAttribute('data-shown', ''))
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-shown', '')
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )
  items.forEach((el) => observer.observe(el))
}
