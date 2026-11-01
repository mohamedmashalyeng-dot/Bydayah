/**
 * عائلة أيقونات خطية موحدة: شبكة 24×24، سماكة 1.6، أطراف مستديرة.
 */

const paths = {
  menu: 'M4 7h16M4 12h16M10 17h10',
  close: 'M6 6l12 12M18 6 6 18',
  // في الواجهة العربية «التالي» يتجه يسارًا و«السابق» يمينًا.
  arrowNext: 'M19 12H5m6-6-6 6 6 6',
  arrowPrev: 'M5 12h14m-6-6 6 6-6 6',
  arrowDown: 'M12 5v14m-6-6 6 6 6-6',
  check: 'M5 12.5 9.5 17 19 7.5',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  profileOff: 'M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5M4 4l16 16',
  imageOff: 'M7.5 5H19a2 2 0 0 1 2 2v10M21 21H5a2 2 0 0 1-2-2V7M3 16l5-5 3 3M15 9.5h.01M3 3l18 18',
  listOff: 'M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01M3 3l18 18',
  steps: 'M4 19h5v-4.5h5V10h5V5.5',
  eyeOff:
    'M3 3l18 18M10.6 6.1c.5-.1.9-.1 1.4-.1 5 0 8.5 4.5 9 6-.3.9-1.2 2.4-2.6 3.7M6.6 7.6C4.6 8.9 3.4 10.8 3 12c.5 1.5 4 6 9 6 1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  people:
    'M8.5 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM16.5 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M15 14.3c.5-.2 1-.3 1.5-.3 2.4 0 4.1 1.7 4.5 4.3',
  userCheck: 'M10 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM3 20c.8-3.6 3.6-5.5 7-5.5 1.3 0 2.5.3 3.5.8M15 18l2 2 4-4.5',
  listen: 'M4 5h16v11H10l-4.5 3.5V16H4V5ZM8 9.5h8M8 12.5h5',
  lock: 'M6 10.5h12a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1ZM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3M12 14.5v2',
  exchange: 'M4 8.5h14m-3.5-3.5L18 8.5 14.5 12M20 15.5H6m3.5-3.5L6 15.5 9.5 19',
  message: 'M4 6.5h16v11H4v-11ZM4.5 7l7.5 6 7.5-6',
  phone: 'M6.5 3.5h3L11 8 8.8 9.4a10.5 10.5 0 0 0 5.8 5.8L16 13l4.5 1.5v3a2 2 0 0 1-2 2C11 19.5 4.5 13 4.5 5.5a2 2 0 0 1 2-2Z',
  compass: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
  scale:
    'M12 4v16M8 20h8M5 7.5h14M12 4.5l-7 3M12 4.5l7 3M5 7.5 2.5 13a2.5 2.5 0 0 0 5 0L5 7.5ZM19 7.5 16.5 13a2.5 2.5 0 0 0 5 0L19 7.5Z',
  globe: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z',
  info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM12 11v5.5M12 7.5h.01',
  alert: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM12 7.5v5.5M12 16.2h.01',
  facebook: 'M16.5 3H14a4.5 4.5 0 0 0-4.5 4.5V10H7v3.5h2.5V21H13v-7.5h2.7l.8-3.5H13V7.5a1 1 0 0 1 1-1h2.5V3Z',
  instagram: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5ZM12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM16.8 7.2h.01',
  tiktok: 'M21 7.917v4.034a9.948 9.948 0 0 1-5-1.951v4.5a6.5 6.5 0 1 1-8-6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917Z',
} as const

export type IconName = keyof typeof paths

type Props = { name: IconName; size?: number; className?: string; label?: string }

export function Icon({ name, size = 24, className, label }: Props) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
