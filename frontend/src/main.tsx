import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AgoraApp } from './AgoraApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <AgoraApp />
  </StrictMode>,
)
