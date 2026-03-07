import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { PlayerContextProvider } from './contexts/PlayerContext.jsx'
import { AuthProvider } from './providers/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <PlayerContextProvider>
            <App />
          </PlayerContextProvider>
        </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
