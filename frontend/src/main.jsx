import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { AppProvider }     from './context/AppContext'
import { AdminProvider }   from './context/AdminContext'
import { PartyProvider }   from './context/PartyContext'
import { VehicleProvider } from './context/VehicleContext'
import { BillProvider }    from './context/BillContext'
import { FinanceProvider } from './context/FinanceContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { NotificationProvider } from './context/NotificationContext'
import App from './App'
import './i18n/i18n'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AdminProvider>
            <PartyProvider>
              <VehicleProvider>
                <BillProvider>
                  <FinanceProvider>
                    <LanguageProvider>
                      <NotificationProvider>
                        <App />
                      </NotificationProvider>
                    </LanguageProvider>
                  </FinanceProvider>
                </BillProvider>
              </VehicleProvider>
            </PartyProvider>
          </AdminProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
