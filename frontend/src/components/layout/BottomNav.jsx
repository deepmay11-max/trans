import { useState, useEffect, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Plus, Users, UserCircle, Truck, MapPin, Wrench, Banknote
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'
import { usePageTranslation } from '../../hooks/usePageTranslation'

export default function BottomNav() {
  const { user, isAdmin } = useAuth()
  const { mode } = useAdmin()
  const navigate = useNavigate()
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  // Batch Translation for Nav Labels
  const { getTranslatedText } = usePageTranslation([
    'Dashboard', 'Bills', 'Parties', 'Border Tax', 'Profile', 'New Job Card'
  ])

  useEffect(() => {
    const checkKeyboard = () => {
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      const isViewportSmall = window.visualViewport ? (window.innerHeight - window.visualViewport.height > 150) : false
      const isWindowSmall = (window.screen.height - window.innerHeight > 250) // Fallback for some Androids
      
      setKeyboardOpen(isInputFocused || isViewportSmall || isWindowSmall)
    }

    // Listen to everything that might indicate a keyboard change
    window.addEventListener('resize', checkKeyboard)
    if (window.visualViewport) window.visualViewport.addEventListener('resize', checkKeyboard)
    document.addEventListener('focusin', checkKeyboard)
    document.addEventListener('focusout', () => setTimeout(checkKeyboard, 100))
    
    // Initial check
    checkKeyboard()

    return () => {
      window.removeEventListener('resize', checkKeyboard)
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', checkKeyboard)
      document.removeEventListener('focusin', checkKeyboard)
      document.removeEventListener('focusout', checkKeyboard)
    }
  }, [])

  const isTransport = isAdmin ? (mode === 'transport') : (user?.role === 'transport')
  const modulePrefix = isTransport ? '/transport' : '/garage'
  
  const leftItems = useMemo(() => [
    { to: `${modulePrefix}/dashboard`, icon: LayoutDashboard, label: getTranslatedText('Dashboard') },
    { to: `${modulePrefix}/bills`,     icon: FileText,        label: getTranslatedText('Bills') },
  ], [modulePrefix, getTranslatedText])

  const rightItems = useMemo(() => {
    const items = [
      { to: `${modulePrefix}/parties`,   icon: Users,           label: getTranslatedText('Parties') }
    ]
    
    if (isTransport) {
      items.push({ to: 'https://staging.parivahan.nic.in/parivahan/en/content/checkpost-tax', icon: Banknote, label: getTranslatedText('Border Tax'), isExternal: true })
    }
    
    items.push({ to: '/profile', icon: UserCircle, label: getTranslatedText('Profile') })
    return items
  }, [isTransport, modulePrefix, getTranslatedText])

  return (
    <nav className={`bottom-nav${keyboardOpen ? ' keyboard-open' : ''}`} role="navigation" aria-label="Bottom navigation">
      <div className="bottom-nav-inner">
        {/* Left Side */}
        {leftItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith('dashboard')}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <div className="bottom-nav-icon-wrap">
              <item.icon size={22} />
            </div>
            <span className="bottom-nav-label">
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Center FAB - New Job for Garage only */}
        {!isTransport && (
          <button
            className="bottom-nav-fab"
            id="btn-create-new"
            onClick={() => navigate('/garage/bills/new')}
            aria-label="New Job Card"
          >
            <div className="fab-btn">
              <Plus size={28} color="white" strokeWidth={3} />
            </div>
            <span className="bottom-nav-label" style={{ marginTop: 6 }}>
              {getTranslatedText('New Job Card')}
            </span>
          </button>
        )}

        {/* Right Side */}
        {rightItems.map((item) => (
          item.isExternal ? (
            <a
              key={item.label}
              href={item.to}
              target="_blank"
              rel="noopener noreferrer"
              className="bottom-nav-item"
            >
              <div className="bottom-nav-icon-wrap">
                <item.icon size={22} />
              </div>
              <span className="bottom-nav-label">
                {item.label}
              </span>
            </a>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <div className="bottom-nav-icon-wrap">
                <item.icon size={22} />
              </div>
              <span className="bottom-nav-label">
                {item.label}
              </span>
            </NavLink>
          )
        ))}
      </div>
    </nav>
  )
}
