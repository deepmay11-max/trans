import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Plus, Users, UserCircle, Truck, MapPin, Wrench, Banknote
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { user, isAdmin } = useAuth()
  const { mode } = useAdmin()
  const navigate = useNavigate()
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    // Use visualViewport API for reliable keyboard detection
    const vv = window.visualViewport
    if (!vv) return

    const threshold = 150 // px difference to consider keyboard open
    const handleResize = () => {
      const heightDiff = window.innerHeight - vv.height
      setKeyboardOpen(heightDiff > threshold)
    }

    vv.addEventListener('resize', handleResize)
    return () => vv.removeEventListener('resize', handleResize)
  }, [])

  const { t } = useTranslation()
  const isTransport = isAdmin ? (mode === 'transport') : (user?.role === 'transport')
  const modulePrefix = isTransport ? '/transport' : '/garage'
  
  // Define nav items for different roles/modes
  const leftItems = [
    { to: `${modulePrefix}/dashboard`, icon: LayoutDashboard, label: t('dashboard') },
    { to: `${modulePrefix}/bills`,     icon: FileText,        label: t('bills') },
  ]

  const rightItems = isTransport ? [
    { to: `${modulePrefix}/parties`,   icon: Users,           label: t('parties') },
    { to: 'https://staging.parivahan.nic.in/parivahan/en/content/checkpost-tax', icon: Banknote, label: t('border_tax'), isExternal: true },
    { to: '/profile',                  icon: UserCircle,      label: t('profile') },
  ] : [
    { to: `${modulePrefix}/parties`,   icon: Users,           label: t('parties') },
    { to: '/profile',                  icon: UserCircle,      label: t('profile') },
  ]

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
              {t('new_job_card')}
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
