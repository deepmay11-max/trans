import React, { useMemo, useState, useEffect } from 'react'
import { Wrench, Car, User, Users, Receipt, TrendingUp, Clock, AlertTriangle, ArrowRight, Plus, Bell, Calendar as CalIcon, X, Shield, Share, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBills } from '../../context/BillContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'
import { getGarageStats } from '../../api/garageApi'
import { apiClient } from '../../api/apiClient'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import BannerSlider from '../../components/BannerSlider'

export default function GarageDashboard() {
  const { user } = useAuth()
  const { bills } = useBills()
  const navigate = useNavigate()
  const location = useLocation()
  const [showReminders, setShowReminders] = useState(false)
  const [apiStats, setApiStats] = useState(null)
  const [banners, setBanners] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const garageBills = useMemo(() => bills.filter(b => b.billType === 'garage'), [bills])

  const { getTranslatedText } = usePageTranslation([
    'Garage Dashboard', 'Manage job cards, spares, and customer vehicle services', 
    'Quick Actions', 'New Job Card', 'Service Alerts', 'Customers', 'Bill History', 
    'Total Sales', 'Receivables', 'Services Done', 'Critical Reminders', 'Upcoming / Recent Jobs', 
    'View All', 'Search Job Cards', 'Close', 'Search by Customer, Vehicle No or Model...', 
    'No results found', 'No active service reminders.', 'Due', 'Delayed by', 'days', 'In', 
    'New Job', 'Share', 'Due Today', 'Upcoming Soon', 'Overdue', 'Upcoming', 'paid', 'unpaid', 'draft',
    'due today', 'upcoming soon',
    // Only translate what's visible in the recent activity list
    ...garageBills.slice(0, 10).map(b => b.customerName),
    ...garageBills.slice(0, 10).map(b => b.vehicleModel)
  ])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setShowSearch(params.get('search') === 'true')
  }, [location.search])
  
  useEffect(() => {
    getGarageStats().then(res => {
      if (res.success) setApiStats(res.stats)
    })
    apiClient.get('/system/banners').then(res => {
      if (res.data.success && res.data.banners) {
        setBanners(res.data.banners.filter(b => b.active))
      }
    }).catch(e => console.error("Banner fetch failed", e))
  }, [])
  
  const formatVehicleNo = (no) => {
    if (!no) return '—'
    const clean = no.toUpperCase().replace(/\s+/g, '')
    if (clean.length === 10) return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6)}`
    return clean
  }

  const filteredBills = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return []
    return garageBills.filter(b => b.customerName?.toLowerCase().includes(q) || b.vehicleNo?.toLowerCase().includes(q) || b.vehicleModel?.toLowerCase().includes(q))
  }, [garageBills, searchTerm])

  const remindersList = useMemo(() => {
    const today = dayjs().startOf('day')
    const latestByVehicle = {}
    garageBills.forEach(b => {
      if (!b.vehicleNo) return
      if (!latestByVehicle[b.vehicleNo] || dayjs(b.billingDate || b.createdAt).isAfter(dayjs(latestByVehicle[b.vehicleNo].billingDate || latestByVehicle[b.vehicleNo].createdAt))) {
        latestByVehicle[b.vehicleNo] = b
      }
    })
    return Object.values(latestByVehicle)
      .filter(b => b.nextServiceDate)
      .map(b => {
        const dueDate = dayjs(b.nextServiceDate)
        const daysDiff = dueDate.diff(today, 'day')
        let status = 'upcoming'
        if (daysDiff < 0) status = 'overdue'
        else if (daysDiff === 0) status = 'due_today'
        else if (daysDiff <= 7) status = 'upcoming_soon'
        return { ...b, daysLeft: daysDiff, reminderStatus: status }
      })
      .filter(r => r.daysLeft <= 180)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [garageBills])

  const stats = [
    { label: 'Total Sales', value: `₹${(apiStats?.totalSales ?? 0).toLocaleString()}`, icon: TrendingUp, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Receivables', value: `₹${(apiStats?.receivables ?? 0).toLocaleString()}`, icon: Clock, color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Services Done', value: (apiStats?.servicesDone ?? 0).toString(), icon: Wrench, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Critical Reminders', value: (apiStats?.criticalReminders ?? remindersList.length).toString(), icon: AlertTriangle, color: '#D97706', bg: '#FEF3C7' },
  ]

  return (
    <div className="page-wrapper animate-fadeIn">
      {showSearch && (
        <div style={{ background: 'white', borderRadius: 24, padding: 20, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1.5px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={18} color="#7C3AED" /> {getTranslatedText('Search Job Cards')}
            </h3>
            <button onClick={() => { setSearchTerm(''); navigate(location.pathname) }} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', cursor: 'pointer' }}>{getTranslatedText('Close')}</button>
          </div>
          <input type="text" placeholder={getTranslatedText('Search by Customer, Vehicle No or Model...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input" style={{ padding: '12px 16px', borderRadius: 14 }} autoFocus />
          {filteredBills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, maxHeight: 300, overflowY: 'auto' }}>
              {filteredBills.map((b, i) => (
                <div key={b._id || i} onClick={() => navigate(`/bills/${b._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '12px', borderRadius: 14, cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{getTranslatedText(b.customerName)} • {formatVehicleNo(b.vehicleNo)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{dayjs(b.billingDate || b.createdAt).format('DD MMM')} • {getTranslatedText(b.vehicleModel)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>₹{(b.grandTotal || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: b.status === 'paid' ? '#16A34A' : '#DC2626' }}>{getTranslatedText(b.status)}</div>
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
          {getTranslatedText('Garage Dashboard')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: 4, fontWeight: 500 }}>
          {getTranslatedText('Manage job cards, spares, and customer vehicle services')}
        </p>
      </div>

      {/* Dynamic Banners Slider */}
      <BannerSlider banners={banners} getTranslatedText={getTranslatedText} />

      {/* Quick Actions */}
      <div className="card" style={{ padding: '24px 16px', marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 16 }}>{getTranslatedText('Quick Actions')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={() => navigate('/garage/bills/new')} style={{ background: '#F5F3FF', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.1)' }}><Plus size={22} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>{getTranslatedText('New Job Card')}</span>
          </button>
          <button onClick={() => setShowReminders(true)} style={{ background: '#FFF7ED', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#F3811E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(243, 129, 30, 0.1)' }}><Bell size={22} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>{getTranslatedText('Service Alerts')}</span>
          </button>
          <button onClick={() => navigate('/garage/parties')} style={{ background: '#ECFDF5', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)' }}><Users size={22} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>{getTranslatedText('Customers')}</span>
          </button>
          <button onClick={() => navigate('/garage/bills')} style={{ background: '#EFF6FF', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.1)' }}><Receipt size={22} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>{getTranslatedText('Bill History')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 14px', position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><s.icon size={18} color={s.color} /></div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginTop: 2 }}>{getTranslatedText(s.label)}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{getTranslatedText('Upcoming / Recent Jobs')}</h3>
          <button onClick={() => navigate('/garage/bills')} className="btn btn-ghost btn-sm" style={{ color: '#7C3AED', fontWeight: 700 }}>{getTranslatedText('View All')}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {garageBills.slice(0, 5).map((b, i) => (
            <div key={b._id || i} onClick={() => navigate(`/bills/${b._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '10px 12px', borderRadius: 14, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{getTranslatedText(b.customerName)} • {formatVehicleNo(b.vehicleNo)}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{dayjs(b.billingDate || b.createdAt).format('DD MMM')} • {getTranslatedText(b.vehicleModel)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>₹{(b.grandTotal || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: b.status === 'paid' ? '#16A34A' : '#DC2626' }}>{getTranslatedText(b.status)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders Modal */}
      {showReminders && (
         <div onClick={() => setShowReminders(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: 'white', height: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F0D2E', margin: 0 }}>{getTranslatedText('Service Alerts')}</h2>
                  <button onClick={() => setShowReminders(false)} style={{ border: 'none', background: '#F3F4F6', color: '#6B7280', borderRadius: 10, width: 44, height: 44, cursor: 'pointer' }}><X size={22} /></button>
               </div>
               <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {remindersList.length > 0 ? remindersList.map((r, index) => (
                     <div key={index} style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                           <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={18} /></div>
                           <div><div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{formatVehicleNo(r.vehicleNo)}</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{r.customerName}</div></div>
                           <div style={{ marginLeft: 'auto' }}><div style={{ fontSize: '0.625rem', fontWeight: 900, padding: '2px 8px', borderRadius: 6, background: '#3B82F6', color: 'white', textTransform: 'uppercase' }}>{getTranslatedText(r.reminderStatus.replace('_', ' '))}</div></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '8px 10px', background: '#F9FAFB', borderRadius: 10 }}>
                           <span>{getTranslatedText('Due')}: {dayjs(r.nextServiceDate).format('DD MMM YYYY')}</span>
                           <span style={{ fontWeight: 700 }}>{r.reminderStatus === 'overdue' ? `${getTranslatedText('Delayed by')} ${Math.abs(r.daysLeft)} ${getTranslatedText('days')}` : `${getTranslatedText('In')} ${r.daysLeft} ${getTranslatedText('days')}`}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                           <button onClick={() => navigate(`/garage/bills/new?vehicleNo=${r.vehicleNo}`)} style={{ flex: 1, background: '#0F0D2E', color: 'white', borderRadius: 10, padding: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{getTranslatedText('New Job')}</button>
                           <button onClick={() => {}} style={{ flex: 1, background: '#16A34A', color: 'white', borderRadius: 10, padding: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{getTranslatedText('Share')}</button>
                        </div>
                     </div>
                  )) : <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}><Bell size={48} style={{ opacity: 0.1, marginBottom: 12 }} /><p>{getTranslatedText('No active service reminders.')}</p></div>}
               </div>
            </div>
         </div>
      )}
    </div>
  )
}
