import '../lib/fonts'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/home.css'
import { useEffect } from 'react'
import { mount } from '../lib/mount'
import { startReveal } from '../lib/motion'
import { HomePage } from './HomePage'

function App() {
  useEffect(() => startReveal(), [])
  return <HomePage />
}

mount(<App />)
