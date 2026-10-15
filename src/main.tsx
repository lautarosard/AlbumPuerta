import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (latin subset covers Spanish) so they are precached by the
// service worker and render offline from the very first visit.
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import './index.css'
import App from './App.tsx'
import { initPwa } from './services/pwa'

initPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
