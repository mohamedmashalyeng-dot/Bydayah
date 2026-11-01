import { useEffect, useRef } from 'react'

/**
 * فيديو خلفية صامت: لا يُحمَّل قبل اقتراب القسم من الشاشة، ويتوقف عند الخروج منها.
 * عند طلب تقليل الحركة تبقى صورته الثابتة وحدها.
 */
export function BackgroundVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // React لا يضبط خاصية muted عند ربط HTML الجاهز، ودونها يمنع المتصفح التشغيل التلقائي.
    video.muted = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause()
          return
        }
        if (!video.src) video.src = src
        video.play().catch(() => {})
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  return <video ref={ref} className="bg-video" poster={poster} muted loop playsInline preload="none" aria-hidden="true" />
}
