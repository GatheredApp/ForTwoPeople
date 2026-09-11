import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './styles.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'

const root = document.getElementById('root')

if (!root) throw new Error('The application root element is missing.')

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
