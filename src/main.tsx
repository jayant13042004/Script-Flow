import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initGoogleAnalytics } from './services/analytics/googleAnalytics'

// Initialize Google Analytics & Google Ads Tag
initGoogleAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
