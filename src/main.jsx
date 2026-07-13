import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@capacitor/app'
import './index.css'
import AppRoot from './App.jsx'

// Block ads from opening the browser
App.addListener('appUrlOpen', ({ url }) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('Blocked external URL:', url)
    return
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
