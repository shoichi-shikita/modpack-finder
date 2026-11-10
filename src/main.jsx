import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startUsageSession, trackOutboundClick } from './services/usageEvents.js'

startUsageSession()
document.addEventListener('click', trackOutboundClick)
document.addEventListener('auxclick', trackOutboundClick)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
