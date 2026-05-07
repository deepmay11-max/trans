import React, { useMemo, useState, useEffect } from 'react'
import { Truck, MapPin, Receipt, TrendingUp, TrendingDown, Clock, ArrowRight, Plus, Users, Shield, Loader2, Layout, AlertCircle, Search, X } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useVehicles } from '../../context/VehicleContext'
import { useParties } from '../../context/PartyContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext'
import { getTransportStats } from '../../api/transportApi'
import { apiClient } from '../../api/apiClient'
import TranslatedText from '../../components/TranslatedText'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import dayjs from 'dayjs'
import BannerSlider from '../../components/BannerSlider'

export default function TransportDashboard() {
  const { bills } = useBills()
  const { vehicles } = useVehicles()
  const { parties } = useParties()
  const { transactions } = useFinance()
  const navigate = useNavigate()
  const location = useLocation()
  const [dbStats, setDbStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState([])

  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Batch Translation for UI Labels
  const { getTranslatedText } = usePageTranslation([
    'Total Revenue', 'All Bills', 'Total Parties', 'Active Accounts', 
    'Total Fleet', 'Live Vehicles', "Today's Expense", 'Fuel & Maintenance',
    'Search Bills...', 'Close', 'Transport', 'Dashboard', 
    'Manage logistics fleet and consolidated freight', 'Quick Actions',
    'Log New Trip', 'Daily Expense', 'Add Vehicle', 'Explore Now',
    'Recent Activity', 'View All', 'Consolidated Bill', 'Trip(s)', 
    'No Activity', 'Paid', 'Unpaid', 'Pending'
  ])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setShowSearch(params.get('search') === 'true')
  }, [location.search])

  useEffect(() => {
    getTransportStats().then(res => {
      if (res.success) setDbStats(res.stats)
      setLoading(false)
    })
    
    // Fetch dynamic banners
    apiClient.get('/system/banners').then(res => {
      if (res.data.success && res.data.banners) {
        setBanners(res.data.banners.filter(b => b.active))
      }
    }).catch(e => console.error("Banner fetch failed", e))
  }, [])

  const transportBills = useMemo(() => bills.filter(b => b.billType === 'transport'), [bills])

  const filteredBills = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return []
    return transportBills.filter(b => 
      b.billedToName?.toLowerCase().includes(q) ||
      b.billNumber?.toLowerCase().includes(q) ||
      b._id?.toLowerCase().includes(q)
    )
  }, [transportBills, searchTerm])

  const stats = useMemo(() => {
    const totalFreight = dbStats?.totalRevenue || 0
    const fleetSize = dbStats?.totalVehicles || 0

    const todayExpense = transactions
      .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'day'))
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    return [
      { label: getTranslatedText('Total Revenue'), value: `₹${totalFreight.toLocaleString()}`, sub: getTranslatedText('All Bills'), icon: TrendingUp, color: '#16A34A', bg: '#DCFCE7', path: '/transport/bills' },
      { label: getTranslatedText('Total Parties'), value: parties.length.toString(), sub: getTranslatedText('Active Accounts'), icon: Users, color: '#7C3AED', bg: '#F5F3FF', path: '/transport/parties' },
      { label: getTranslatedText('Total Fleet'), value: fleetSize.toString(), sub: getTranslatedText('Live Vehicles'), icon: Users, color: '#2563EB', bg: '#DBEAFE', path: '/transport/vehicles' },
      { label: getTranslatedText("Today's Expense"), value: `₹${todayExpense.toLocaleString()}`, sub: getTranslatedText('Fuel & Maintenance'), icon: TrendingDown, color: '#DC2626', bg: '#FEE2E2', path: '/transport/expenses' },
    ]
  }, [dbStats, transactions, parties.length, getTranslatedText])

  const getStatusLabel = (status) => {
    const s = status?.toLowerCase()
    if (s === 'paid') return getTranslatedText('Paid')
    if (s === 'unpaid') return getTranslatedText('Unpaid')
    return getTranslatedText('Pending')
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 60 }}>
      {/* Search Experience */}
      {showSearch && (
        <div style={{ background: 'white', borderRadius: 24, padding: 20, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1.5px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={18} color="#4F46E5" /> {getTranslatedText('Search Bills...')}
            </h3>
            <button 
              onClick={() => {
                setSearchTerm('')
                navigate(location.pathname)
              }} 
              style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <X size={14} /> {getTranslatedText('Close')}
            </button>
          </div>
          <input 
            type="text" 
            placeholder={getTranslatedText('Search Bills...')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input" 
            style={{ marginBottom: filteredBills.length > 0 ? 16 : 0, padding: '12px 16px', borderRadius: 14 }}
            autoFocus
          />
          
          {filteredBills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
              {filteredBills.map((b, i) => (
                <div key={b._id || i} onClick={() => navigate(`/bills/${b._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F9FAFB', padding: '14px', borderRadius: 20, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF7ED', color: '#F3811E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Receipt size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.billedToName ? <TranslatedText>{b.billedToName}</TranslatedText> : getTranslatedText('Consolidated Bill')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{b.items?.length || 0} {getTranslatedText('Trip(s)')} • {dayjs(b.billingDate || b.createdAt).format('DD MMM')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111827' }}>₹{(b.grandTotal || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: b.status === 'paid' ? '#16A34A' : '#DC2626' }}>{getStatusLabel(b.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Header */}
      <div style={{ marginBottom: 24, padding: '0 4px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
          {getTranslatedText('Transport')} {getTranslatedText('Dashboard')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: 4, fontWeight: 500 }}>
          {getTranslatedText('Manage logistics fleet and consolidated freight')}
        </p>
      </div>

      {/* Dynamic Banners Slider */}
      <BannerSlider banners={banners} getTranslatedText={getTranslatedText} />

      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: 28, padding: '24px', marginBottom: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 20 }}>{getTranslatedText('Quick Actions')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <button onClick={() => navigate('/transport/trips')} style={{ background: '#F5F3FF', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.1)' }}>
              <Truck size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>{getTranslatedText('Log New Trip')}</span>
          </button>

          <button onClick={() => navigate('/transport/expenses')} style={{ background: '#FFF7ED', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#F3811E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(243, 129, 30, 0.1)' }}>
              <TrendingDown size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>{getTranslatedText('Daily Expense')}</span>
          </button>

          <button onClick={() => navigate('/transport/vehicles')} style={{ background: '#ECFDF5', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)' }}>
              <Plus size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>{getTranslatedText('Add Vehicle')}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {stats.map(s => (
          <div 
            key={s.label} 
            onClick={() => s.path && navigate(s.path)}
            style={{ 
              background: 'white', borderRadius: 24, padding: '16px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)',
              cursor: 'pointer', transition: 'transform 0.2s',
              userSelect: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white', borderRadius: 28, padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{getTranslatedText('Recent Activity')}</h3>
          <button onClick={() => navigate('/transport/bills')} className="btn btn-ghost btn-sm" style={{ color: '#4F46E5', fontWeight: 800 }}>{getTranslatedText('View All')}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transportBills.slice(0, 4).map((b, i) => (
            <div key={b._id || i} onClick={() => navigate(`/bills/${b._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F9FAFB', padding: '14px', borderRadius: 20, cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF7ED', color: '#F3811E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Receipt size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.billedToName ? <TranslatedText>{b.billedToName}</TranslatedText> : getTranslatedText('Consolidated Bill')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                   {b.items?.length || 0} {getTranslatedText('Trip(s)')} • {dayjs(b.billingDate || b.createdAt).format('DD MMM')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111827' }}>₹{(b.grandTotal || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: b.status === 'paid' ? '#16A34A' : '#DC2626' }}>{getStatusLabel(b.status)}</div>
              </div>
            </div>
          ))}
          {transportBills.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '0.875rem' }}>{getTranslatedText('No Activity')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
