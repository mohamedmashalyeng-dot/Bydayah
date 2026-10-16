import { useEffect, useRef, useState } from 'react'
import { stagger } from '../lib/motion'

type Step = { title: string; text: string }
type Threads = { width: number; height: number; a: string; b: string; start: number; spread: number }

/**
 * رحلة من ست مراحل يربطها خيطان: يبدآن متباعدين عند المرحلة الأولى ويقتربان
 * تدريجيًا حتى يلتقيا عند المرحلة الأخيرة. الخيطان زخرفيان ويُرسمان بعد قياس
 * مواضع المراحل الفعلية، أما النصوص فمتاحة كاملة دون انتظار أي حركة.
 */
export function Journey({ steps }: { steps: Step[] }) {
  const listRef = useRef<HTMLOListElement>(null)
  const railRef = useRef<SVGSVGElement>(null)
  const [threads, setThreads] = useState<Threads | null>(null)

  useEffect(() => {
    const list = listRef.current
    const rail = railRef.current
    if (!list || !rail) return

    const measure = () => {
      const items = Array.from(list.querySelectorAll<HTMLElement>('.journey__step'))
      if (!items.length) return
      const width = rail.clientWidth
      const height = list.offsetHeight
      const cx = width / 2
      const spread = Math.min(30, cx - 5)
      // offsetTop يتجاهل التحويلات، فلا يتأثر القياس بحركة الظهور.
      const ys = items.map((li) => {
        const node = li.querySelector<HTMLElement>('.journey__node')!
        return li.offsetTop + node.offsetTop + node.offsetHeight / 2
      })
      const last = ys.length - 1
      const line = (side: 1 | -1) => {
        const x = (i: number) => cx + side * spread * (1 - i / last)
        let d = `M${x(0)} ${ys[0]}`
        for (let i = 0; i < last; i++) {
          const mid = (ys[i + 1] - ys[i]) / 2
          d += `C${x(i)} ${ys[i] + mid} ${x(i + 1)} ${ys[i + 1] - mid} ${x(i + 1)} ${ys[i + 1]}`
        }
        return d
      }
      setThreads({ width, height, a: line(-1), b: line(1), start: ys[0], spread })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="journey" data-reveal>
      <svg
        ref={railRef}
        className="journey__rail"
        width={threads?.width}
        height={threads?.height}
        viewBox={threads ? `0 0 ${threads.width} ${threads.height}` : undefined}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {threads && (
          <>
            <path className="journey__thread" d={threads.a} pathLength={1} stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
            <path className="journey__thread journey__thread--b" d={threads.b} pathLength={1} stroke="var(--green)" strokeWidth="2" strokeLinecap="round" />
            <circle cx={threads.width / 2 - threads.spread} cy={threads.start} r="3.5" fill="var(--gold)" />
            <circle cx={threads.width / 2 + threads.spread} cy={threads.start} r="3.5" fill="var(--green)" />
          </>
        )}
      </svg>

      <ol className="journey__list" ref={listRef}>
        {steps.map((step, i) => (
          <li className="journey__step" key={step.title} data-reveal style={stagger(i)}>
            <span className="journey__node" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="journey__body">
              <h3 className="journey__title">{step.title}</h3>
              <p className="journey__text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
