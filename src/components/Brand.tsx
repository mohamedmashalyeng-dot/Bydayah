/**
 * الرمز البصري لبداية: «مساران يلتقيان عند بداية جديدة».
 * خطان مستقلان ينطلقان من نقطتين مختلفتين ثم يرتفعان ليكوّنا قوسًا مفتوحًا،
 * وتتوسط الفجوةَ في أعلاه نقطة ذهبية. أصل بصري قابل للاستبدال، وليس شعارًا معتمدًا.
 */

import { brand } from '../content/site'

/*
 * هندسة الرسم الرئيسي: مركز القوس (260،300) ونصف قطره 132.
 * كل مسار يبدأ من نقطة مختلفة على الأرض، يمضي أفقيًا ثم ينعطف صاعدًا إلى القوس.
 */
const PATH_GOLD = 'M28 584H70Q128 584 128 526V300A132 132 0 0 1 250 168.4'
const PATH_GREEN = 'M480 584H446Q392 584 392 530V300A132 132 0 0 0 270 168.4'
const VIEWBOX = '0 96 520 500'

export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className ? `brand-mark ${className}` : 'brand-mark'}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8.5 27.5V15.5a7.5 7.5 0 0 1 5.3-7.17" stroke="var(--mark-a, var(--gold))" strokeWidth="2.6" />
      <path d="M23.5 27.5V15.5a7.5 7.5 0 0 0-5.3-7.17" stroke="var(--mark-b, var(--green))" strokeWidth="2.6" />
      <circle cx="16" cy="4.6" r="1.6" fill="var(--mark-a, var(--gold))" />
    </svg>
  )
}

export function Logo({ href = '/', tone = 'dark' }: { href?: string; tone?: 'dark' | 'light' }) {
  return (
    <a className={`logo logo--${tone}`} href={href}>
      <BrandMark size={34} />
      <span className="logo__text">
        <span className="logo__ar">{brand.nameAr}</span>
        <span className="logo__en" lang="en" dir="ltr">
          {brand.nameEn}
        </span>
      </span>
      <span className="sr-only"> — الصفحة الرئيسية</span>
    </a>
  )
}

/** quiet: نسخة أهدأ دون الضوء الذهبي داخل الباب، لرؤوس الصفحات الداخلية. */
export function HeroArt({ quiet = false }: { quiet?: boolean }) {
  return (
    <svg className="hero-art" viewBox={VIEWBOX} fill="none" aria-hidden="true" focusable="false">
      {!quiet && (
        <defs>
          <clipPath id="hero-door">
            <path d="M156 584V300a104 104 0 0 1 208 0v284Z" />
          </clipPath>
        </defs>
      )}

      {/* أقواس خارجية خافتة تمنح العمق — تُخفى في النسخة المختصرة على الهاتف */}
      <g className="hero-art__extra" stroke="var(--green)" strokeWidth="1">
        <path d="M100 584V300a160 160 0 0 1 320 0v284" opacity=".14" />
        <path d="M72 584V300a188 188 0 0 1 376 0v284" opacity=".1" strokeDasharray="1.5 7" strokeLinecap="round" />
      </g>

      {/* الباب: مساحة خضراء فاتحة يشرق داخلها ضوء ذهبي هادئ */}
      <path d="M156 584V300a104 104 0 0 1 208 0v284Z" fill="var(--mist)" />
      {!quiet && (
        <g clipPath="url(#hero-door)">
          <g className="hero-art__sun">
            <circle cx="260" cy="584" r="132" stroke="var(--gold)" strokeWidth="1" opacity=".45" />
            <circle cx="260" cy="584" r="94" fill="var(--gold)" opacity=".2" />
            <circle cx="260" cy="584" r="58" fill="var(--gold)" opacity=".32" />
          </g>
        </g>
      )}

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
