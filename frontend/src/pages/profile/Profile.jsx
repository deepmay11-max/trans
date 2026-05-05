import { useMemo } from 'react'
import { UserCircle, Building2, CreditCard, QrCode, ChevronRight, LogOut, Zap, Calendar, PenTool, Share2, HelpCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import TranslatedText from '../../components/TranslatedText'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Search as SearchIcon, X as CloseIcon } from 'lucide-react'
import dayjs from 'dayjs'

// menuItems will be handled inside the component with t()

export default function Profile() {
  const { getTranslatedText } = usePageTranslation([
    'Personal Profile', 'Business Details', 'Bank Details', 'QR Code', 'Subscription',
    'Help & Support', 'Share App', 'Edit personal information', 'Manage business info & address',
    'Update payment receiving accounts', 'Your UPI payment QR', 'Manage your plan & billing',
    'Get assistance or report issues', 'Recommend Trans to others', 'Logo', 'Signature',
    'Business Owner', 'Edit Profile', 'Garage', 'Transport', 'Admin', 'Account',
    'Current Plan', 'Active', 'Expired', 'Expires on', 'Manage', 'Search', 'Cancel', 'Logout'
  ])
  const { user, logout, isAdmin } = useAuth()
  const { language, changeLanguage } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('search') === 'true') {
      setShowSearch(true)
    }
  }, [location.search])

  const menuItems = useMemo(() => {
    const items = [
      { icon: UserCircle, label: getTranslatedText('Personal Profile'), sub: getTranslatedText('Edit personal information'), to: '/profile/edit', color: '#7C3AED' },
    ]

    if (!isAdmin) {
      items.push(
        { icon: Building2,  label: getTranslatedText('Business Details'), sub: getTranslatedText('Manage business info & address'), to: '/profile/business', color: 'var(--primary)' },
        { icon: CreditCard, label: getTranslatedText('Bank Details'),     sub: getTranslatedText('Update payment receiving accounts'), to: '/profile/bank',     color: '#2563EB'        },
        { icon: QrCode,     label: getTranslatedText('QR Code'),          sub: getTranslatedText('Your UPI payment QR'),          to: '/profile/qr',       color: '#16A34A'        },
        { icon: Zap,        label: getTranslatedText('Subscription'),     sub: getTranslatedText('Manage your plan & billing'),     to: '/subscription',     color: '#D97706'        }
      )
    }

    items.push(
      { icon: HelpCircle, label: getTranslatedText('Help & Support'),     sub: getTranslatedText('Get assistance or report issues'),     to: '/profile/support',  color: '#0EA5E9'        },
      { icon: Share2,     label: getTranslatedText('Share App'),        sub: getTranslatedText('Recommend Trans to others'),        onClick: 'share',      color: '#7C3AED'        }
    )

    return items
  }, [getTranslatedText, isAdmin])

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return menuItems
    return menuItems.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sub.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [menuItems, searchTerm])

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.phone?.slice(-2) || '?'

  const handleSupport = () => {
    const waUrl = `https://wa.me/919999999999?text=${encodeURIComponent("Hello! I need help with the Trans app.")}`
    window.open(waUrl, '_blank')
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Trans',
      text: 'Join Trans and manage your fleet and invoices easily!',
      url: window.location.origin
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`
        window.open(waUrl, '_blank')
      }
    } catch (err) {
      console.warn('Share error:', err)
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn">
      {/* Profile header */}
      <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '28px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="avatar avatar-lg" style={{ margin: '0 auto 8px', width: 64, height: 64, fontSize: '1.25rem', overflow: 'hidden', background: '#F1F5F9', border: '2px solid #E2E8F0' }}>
              {user?.logoUrl ? (
                <img src={user.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
              ) : initials}
            </div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', margin: 0 }}>{getTranslatedText('Logo')}</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: '#FFF1F2', border: '2px solid #FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto 8px' }}>
              {user?.signatureUrl ? (
                <img src={user.signatureUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Signature" />
              ) : (
                <PenTool size={24} color="#E11D48" />
              )}
            </div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', margin: 0 }}>{getTranslatedText('Signature')}</p>
          </div>
        </div>

        <h3 style={{ fontWeight: 800, fontSize: '1.125rem', margin: '8px 0 0' }}><TranslatedText>{user?.businessName || user?.name || getTranslatedText('Business Owner')}</TranslatedText></h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4, marginBottom: 0 }}>
          +91 {user?.phone?.replace(/(\d{5})(\d{5})/, '$1 $2') || 'XXXXX XXXXX'}
        </p>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button 
            onClick={() => navigate('/profile/business')}
            className="btn btn-sm" 
            style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <UserCircle size={14} /> {getTranslatedText('Edit Profile')}
          </button>
          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
            {user?.role === 'garage' ? getTranslatedText('Garage') : user?.role === 'transport' ? getTranslatedText('Transport') : getTranslatedText('Admin')} {getTranslatedText('Account')}
          </span>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16, background: 'linear-gradient(135deg, #FDFCFB 0%, #F5F3FF 100%)', border: '1px solid #7C3AED20' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.1)' }}>
            <Zap size={22} color={user?.subscriptionActive ? '#7C3AED' : '#94A3B8'} fill={user?.subscriptionActive ? '#7C3AED' : 'none'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{getTranslatedText('Current Plan')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
              {user?.subscriptionActive ? (user?.planName || 'Active Plan') : 'No Active Plan'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {user?.subscriptionActive ? (
              <span className="badge badge-success">{getTranslatedText('Active')}</span>
            ) : (
              <span className="badge badge-danger">{getTranslatedText('Expired')}</span>
            )}
          </div>
        </div>
        
        {user?.subscriptionExpiry && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              <Calendar size={14} /> {getTranslatedText('Expires on')} {dayjs(user.subscriptionExpiry).format('DD MMM YYYY')}
            </div>
            <button 
              onClick={() => navigate('/subscription')}
              style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              {getTranslatedText('Manage')}
            </button>
          </div>
        )}
      </div>

      {/* Language Selection */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Language / भाषा</h4>
          <span className="badge badge-info">{language === 'en' ? 'English' : 'हिंदी'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => changeLanguage('en')}
            className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8125rem' }}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('hi')}
            className={`btn btn-sm ${language === 'hi' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8125rem' }}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="animate-slideDown" style={{ marginBottom: 16 }}>
          <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'white', borderRadius: 16, border: '1.5px solid var(--primary)', height: 48 }}>
            <SearchIcon size={18} color="var(--primary)" />
            <input 
              autoFocus
              type="text" 
              placeholder={getTranslatedText('Search')} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
            />
            {searchTerm && (
              <CloseIcon 
                size={18} 
                onClick={() => setSearchTerm('')} 
                style={{ cursor: 'pointer', color: '#94A3B8' }} 
              />
            )}
            <button 
              onClick={() => { setShowSearch(false); setSearchTerm(''); navigate('/profile', { replace: true }) }}
              style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              {getTranslatedText('Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        {filteredMenuItems.map((item, i) => (
          <button
            key={item.label}
            id={`btn-profile-${item.label.toLowerCase().replace(/ /g, '-')}`}
            onClick={() => {
              if (item.onClick === 'share') handleShare()
              else if (item.onClick === 'support') handleSupport()
              else navigate(item.to)
            }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: 14, padding: '16px 20px', background: 'none',
              border: 'none', borderBottom: i < filteredMenuItems.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: item.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        ))}
        {filteredMenuItems.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>No results found</p>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        id="btn-profile-logout"
        className="btn btn-ghost btn-full"
        onClick={async () => { await logout(); navigate(user?.role === 'admin' ? '/admin' : '/login') }}
        style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)', gap: 8 }}
      >
        <LogOut size={16} /> {getTranslatedText('Logout')}
      </button>
    </div>
  )
}
