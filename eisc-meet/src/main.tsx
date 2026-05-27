import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router.tsx'
import AuthBootstrap from './components/AuthBootstrap.tsx'
import './index.css'

const storedSettings = localStorage.getItem('eisc-meet:settings')

if (storedSettings) {
  try {
    const settings = JSON.parse(storedSettings) as { highContrast?: boolean; reduceMotion?: boolean; largeText?: boolean }
    document.documentElement.classList.toggle('a11y-high-contrast', Boolean(settings.highContrast))
    document.documentElement.classList.toggle('a11y-reduce-motion', Boolean(settings.reduceMotion))
    document.documentElement.classList.toggle('a11y-large-text', Boolean(settings.largeText))
  } catch {
    localStorage.removeItem('eisc-meet:settings')
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  </StrictMode>,
)
