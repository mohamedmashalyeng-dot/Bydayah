import { StrictMode, type ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

/** يربط React بمحتوى الصفحة المولّد مسبقًا عند البناء، أو يرسمه مباشرة أثناء التطوير. */
export function mount(app: ReactNode) {
  const root = document.getElementById('root')!
  const tree = <StrictMode>{app}</StrictMode>
  if (root.firstElementChild) hydrateRoot(root, tree)
  else createRoot(root).render(tree)
}
