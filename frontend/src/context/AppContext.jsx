import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true'
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('view_mode') || 'transport'
  )


  const toggleSidebar = () => setSidebarCollapsed(p => {
    const next = !p
    localStorage.setItem('sidebar_collapsed', String(next))
    return next
  })
  const toggleMobileMenu = () => setMobileMenuOpen(p => !p)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const switchViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('view_mode', mode)
  }


  return (
    <AppContext.Provider value={{
      sidebarCollapsed,
      toggleSidebar,
      mobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      viewMode,
      switchViewMode,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
