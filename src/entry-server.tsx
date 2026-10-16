import { renderToString } from 'react-dom/server'
import { AboutPage } from './about/AboutPage'
import { ApplyPage } from './apply/ApplyPage'
import { ContactPage } from './contact/ContactPage'
import { HomePage } from './home/HomePage'

export const pages = {
  'index.html': () => renderToString(<HomePage />),
  'apply/index.html': () => renderToString(<ApplyPage />),
  'about/index.html': () => renderToString(<AboutPage />),
  'contact/index.html': () => renderToString(<ContactPage />),
}
