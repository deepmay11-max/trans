import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Bell, Search, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNotifications } from '../../context/NotificationContext'
import { useTranslation } from 'react-i18next'
import NotificationDropdown from './NotificationDropdown'
import { useState } from 'react'

/**
 * MobileHeader — shown only on mobile (< 768px)
 */
export default function MobileHeader({
  title,
  showBack = false,
  rightAction,
  onBack,
  showNotif = true,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleMobileMenu } = useApp()
  const { unreadCount } = useNotifications()
  const [notifOpen, setNotifOpen] = useState(false)
  const handleBack = () => { if (onBack) onBack(); else navigate(-1) }

  return (
    <header
      id="mob-header"
      className="mobile-header fixed top-0 left-0 right-0"
      style={{
        position: 'fixed',
        background: 'rgba(240, 239, 234, 0.75)', /* blends with --bg */
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '0 16px',
        height: '60px', /* Increased for better touch */
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            id="btn-mobile-back"
            onClick={handleBack}
            aria-label="Go back"
            style={{
              width: 34, height: 34, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg)', border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={toggleMobileMenu}
              style={{
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <Menu size={20} />
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #1E1B4B, #4C1D95)',
              padding: '4px 12px 4px 8px',
              borderRadius: 99,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: '0.66rem', fontWeight: 900 }}>TR</span>
              </div>
              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                TRANS
              </span>
            </div>
          </div>
        )}

        {title && showBack && (
          <h1 style={{
            fontSize: '0.9375rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            {title}
          </h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {rightAction || (
          <>
            <button
              className="btn-icon"
              aria-label="Search"
              id="btn-mobile-search"
              onClick={() => {
                if (location.pathname.endsWith('/dashboard')) {
                  navigate(`${location.pathname}?search=true`)
                } else {
                  navigate(location.pathname.startsWith('/transport') ? '/transport/bills' : '/garage/bills')
                }
              }}
              style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,0.05)', cursor: 'pointer' }}
            >
              <Search size={17} />
            </button>
            {showNotif && (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn-icon"
                  aria-label="Notifications"
                  id="btn-mobile-notifications"
                  onClick={() => setNotifOpen(prev => !prev)}
                  style={{ 
                    width: 34, height: 34, borderRadius: 10, 
                    background: notifOpen ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0,0,0,0.05)', 
                    position: 'relative', cursor: 'pointer',
                    color: notifOpen ? '#6366F1' : 'inherit'
                  }}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 7, right: 7,
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--danger)', border: '1.5px solid white'
                    }} />
                  )}
                </button>
                {notifOpen && (
                  <NotificationDropdown 
                    onClose={() => setNotifOpen(false)} 
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </header>
  )
}
