/**
 * الهوية البصرية لبداية.
 * الشعار المعتمد: كلمة «بداية» يتوسطها قلب من شخصين (أزرق بترولي وذهبي)، وأسفلها BIDAYA.
 * الرسوم الزخرفية (HeroArt وMotifLines): «مساران يلتقيان عند بداية جديدة».
 */

import { brand } from '../content/site'
import { HEART, LATIN, MARK } from './logoPaths'

/** ألوان الشعار من متغيرات CSS، لتتبدّل في النسخة الفاتحة فوق الأخضر. */
const INK = 'var(--logo-ink)'
const ACCENT = 'var(--logo-accent)'

/*
 * هندسة الرسم الرئيسي: مركز القوس (260،300) ونصف قطره 132.
 * كل مسار يبدأ من نقطة مختلفة على الأرض، يمضي أفقيًا ثم ينعطف صاعدًا إلى القوس.
 */
const PATH_GOLD = 'M28 584H70Q128 584 128 526V300A132 132 0 0 1 250 168.4'
const PATH_GREEN = 'M480 584H446Q392 584 392 530V300A132 132 0 0 0 270 168.4'
const VIEWBOX = '0 96 520 500'

/** القلب وحده، للمساحات الصغيرة (الفواصل). */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className ? `brand-mark ${className}` : 'brand-mark'}
      width={size}
      height={size}
      viewBox={HEART.viewBox}
      aria-hidden="true"
      focusable="false"
    >
      <path fillRule="evenodd" fill={INK} d={HEART.ink} />
      <path fillRule="evenodd" fill={ACCENT} d={HEART.gold} />
    </svg>
  )
}

/**
 * الشعار رابطًا إلى الرئيسية.
 * lockup: الكلمة مع سطر BIDAYAH أسفلها (للفوتر)؛ دونه الكلمة وحدها (للهيدر).
 */
export function Logo({
  href = '/',
  tone = 'dark',
  lockup = false,
}: {
  href?: string
  tone?: 'dark' | 'light'
  lockup?: boolean
}) {
  return (
    <a className={`logo logo--${tone}`} href={href}>
      <svg
        className={lockup ? 'logo__art logo__art--lockup' : 'logo__art'}
        viewBox={lockup ? LATIN.viewBox : MARK.viewBox}
        aria-hidden="true"
        focusable="false"
      >
        <path fillRule="evenodd" fill={INK} d={MARK.ink} />
        <path fillRule="evenodd" fill={ACCENT} d={MARK.gold} />
        {lockup && (
          <>
            <path fillRule="evenodd" fill={INK} d={LATIN.ink} />
            <path fillRule="evenodd" fill={ACCENT} d={LATIN.gold} />
          </>
        )}
      </svg>
      <span className="sr-only">
        {brand.nameAr} — الصفحة الرئيسية
      </span>
    </a>
  )
}

/** الرسم الرئيسي: الباب والمساران، في رأس صفحة «من نحن». */
export function HeroArt() {
  return (
    <svg className="hero-art" viewBox={VIEWBOX} fill="none" aria-hidden="true" focusable="false">
      {/* أقواس خارجية خافتة تمنح العمق — تُخفى في النسخة المختصرة على الهاتف */}
      <g className="hero-art__extra" stroke="var(--green)" strokeWidth="1">
        <path d="M100 584V300a160 160 0 0 1 320 0v284" opacity=".14" />
        <path d="M72 584V300a188 188 0 0 1 376 0v284" opacity=".1" strokeDasharray="1.5 7" strokeLinecap="round" />
      </g>

      {/* الباب: مساحة خضراء فاتحة */}
      <path d="M156 584V300a104 104 0 0 1 208 0v284Z" fill="var(--mist)" />

      <line x1="8" y1="584" x2="512" y2="584" stroke="var(--green)" strokeWidth="1" opacity=".18" />

      {/* المساران */}
      <path className="hero-art__path hero-art__path--a" d={PATH_GOLD} pathLength={1} stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
      <path className="hero-art__path hero-art__path--b" d={PATH_GREEN} pathLength={1} stroke="var(--green)" strokeWidth="3.5" strokeLinecap="round" />

      {/* نقطتا الانطلاق ونقطة الالتقاء */}
      <circle className="hero-art__dot hero-art__dot--start" cx="28" cy="584" r="5" fill="var(--gold)" />
      <circle className="hero-art__dot hero-art__dot--start" cx="480" cy="584" r="5" fill="var(--green)" />
      <circle className="hero-art__dot hero-art__dot--key" cx="260" cy="168" r="6.5" fill="var(--gold)" />
    </svg>
  )
}

/** نسخة خطية مبسطة من الرمز، تُستخدم بشفافية منخفضة كخلفية للأقسام. */
export function MotifLines({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={VIEWBOX} fill="none" aria-hidden="true" focusable="false">
      <path d={PATH_GOLD} stroke="var(--motif-a, currentColor)" strokeWidth="2" strokeLinecap="round" />
      <path d={PATH_GREEN} stroke="var(--motif-b, currentColor)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="260" cy="168" r="5" fill="var(--motif-a, currentColor)" />
    </svg>
  )
}

/** فاصل رفيع بين الأقسام يتوسطه القوس الصغير. يُستخدم في مواضع محدودة. */
export function Divider() {
  return (
    <div className="divider container" aria-hidden="true">
      <span className="divider__line" />
      <BrandMark size={28} />
      <span className="divider__line" />
    </div>
  )
}
