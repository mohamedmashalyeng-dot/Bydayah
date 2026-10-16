import '../lib/fonts'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/about.css'
import { useEffect } from 'react'
import { mount } from '../lib/mount'
import { startReveal } from '../lib/motion'
import { AboutPage } from './AboutPage'

function App() {
  useEffect(() => startReveal(), [])
  return <AboutPage />
}

mount(<App />)
