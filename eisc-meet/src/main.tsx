import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router.tsx'
import AuthBootstrap from './components/AuthBootstrap.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  </StrictMode>,
)
