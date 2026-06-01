import React, { useState, useMemo, useEffect } from 'react'
import {
  Building2, Search, Plus, Edit3, Trash2, MapPin,
  Phone, ChevronLeft, ChevronRight, X, Globe,
  Truck, Wrench, Users, CreditCard, MoreVertical, Loader2
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { getAdminUserHistory } from '../../api/adminApi'

const ITEMS_PER_PAGE = 8

const formatName = (str) => {
  if (!str) return ''
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function BusinessModal({ mode, existing, onSave, onClose }) {
  const isTransport = mode === 'transport'
  const label = isTransport ? 'Transport Business' : 'Garage / Workshop'
  const [form, setForm] = useState(() => {
    if (!existing) return { name: '', ownerName: '', phone: '', location: '', city: '', gstNo: '', status: 'Active' }
    return {
      name: existing.name || '',
      ownerName: existing.ownerName || '',
      phone: existing.phone || '',
      location: (existing.location && existing.location !== 'null') ? existing.location : '',
      city: (existing.city && existing.city !== 'null') ? existing.city : '',
      gstNo: (existing.gstNo && existing.gstNo !== 'null') ? existing.gstNo : '',
      status: existing.status || 'Active'
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // GST Validation if provided
    if (form.gstNo && form.gstNo !== 'null') {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/
      if (!gstRegex.test(form.gstNo)) {
        setError('Invalid GST format. Correct format: 27AAAAA1234A1Z5')
        setSaving(false)
        return
      }
    }

    try {
      const ok = await onSave(form)
      if (ok) {
        onClose()
      } else {
        setError('Operation failed. Please check inputs or contact support.')
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
      overscrollBehavior: 'contain'
    }} onClick={onClose}>
      <div className="card animate-scaleIn" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, padding: 0, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
          <h3 style={{ margin: 0, fontWeight: 900 }}>{existing ? 'Edit' : 'Register'} {label}</h3>
          <button className="btn-icon" onClick={onClose} disabled={saving}><X size={20} /></button>
        </div>
        
        {error && (
          <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: '#FEE2E2', borderLeft: '4px solid #EF4444', borderRadius: 6, color: '#991B1B', fontSize: '0.8125rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">BUSINESS NAME *</label>
            <div className="input-group">
              <Building2 className="input-icon" size={18} />
              <input 
                type="text" className="form-input" 
                placeholder={isTransport ? 'e.g. Sharma Logistics Pvt Ltd' : 'e.g. City Auto Workshop'} required 
                value={form.name} 
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                onBlur={e => setForm(p => ({ ...p, name: formatName(e.target.value) }))}
                disabled={saving} 
                style={{ textTransform: 'capitalize' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">OWNER NAME *</label>
              <input 
                type="text" className="form-input" placeholder="Owner / Proprietor" required 
                value={form.ownerName} 
                onChange={e => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                  setForm(p => ({ ...p, ownerName: val }))
                }} 
                onBlur={e => {
                  setForm(p => ({ ...p, ownerName: formatName(e.target.value) }))
                }}
                disabled={saving} 
                style={{ textTransform: 'capitalize' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">PHONE</label>
              <div className="input-group">
                <Phone className="input-icon" size={18} />
                <input 
                  type="tel" className="form-input" placeholder="10-digit mobile number" 
                  value={form.phone} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setForm(p => ({ ...p, phone: val }))
                  }} 
                  disabled={saving} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">ADDRESS / AREA</label>
              <div className="input-group">
                <MapPin className="input-icon" size={18} />
                <input 
                  type="text" className="form-input" placeholder="Street / Area" 
                  value={form.location} 
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))} 
                  onBlur={e => setForm(p => ({ ...p, location: formatName(e.target.value) }))}
                  disabled={saving} 
                  style={{ textTransform: 'capitalize' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">CITY</label>
              <input 
                type="text" className="form-input" placeholder="City" 
                value={form.city} 
                onChange={e => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                  setForm(p => ({ ...p, city: val }))
                }} 
                onBlur={e => {
                  setForm(p => ({ ...p, city: formatName(e.target.value) }))
                }}
                disabled={saving} 
                style={{ textTransform: 'capitalize' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                GST NUMBER
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Optional</span>
              </label>
              <input 
                type="text" className="form-input" placeholder="e.g. 27AAAAA0000A1Z5" 
                value={form.gstNo} 
                onChange={e => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15)
                  setForm(p => ({ ...p, gstNo: val }))
                }} 
                disabled={saving} 
                style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '0.65rem', color: '#64748B', fontWeight: 500 }}>
                Format: 2 State Code + 10 PAN + 1 Entity + 1 Z + 1 Check Sum
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">STATUS</label>
              <select className="form-input" value={form.status} onChange={set('status')} disabled={saving}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending Verification</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost btn-full" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : (existing ? 'Save Changes' : 'Register Business')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ManageBusiness({ mode: propMode }) {
  const {
    mode: contextMode,
    businesses,
    loading,
    addBusiness,
    updateBusiness,
    deleteBusiness
  } = useAdmin()

  const mode = propMode || contextMode
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'
  const accentLight = '#EDE9FE'

  const [modal, setModal] = useState(null)
  const [history, setHistory] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  // Prevent background scrolling when modal or history is open
  useEffect(() => {
    const isModalOpen = !!(modal || history)
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => { 
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [modal, history])

  const handleViewHistory = async (biz) => {
    setLoadingHistory(true)
    try {
      const res = await getAdminUserHistory(biz.id)
      if (res.success) {
        setHistory({
          id: biz.id,
          name: biz.name,
          isTransport: isTransport,
          data: res.history // contains { trips, bills, vehicles }
        })
      }
    } catch (e) {
      alert("Failed to fetch history")
    } finally {
      setLoadingHistory(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return businesses.filter(b => {
      const matchSearch = !q || b.name?.toLowerCase().includes(q) || b.ownerName?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || b.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [businesses, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSave = async (form) => {
    let ok = false
    if (modal?.id) {
      ok = await updateBusiness(modal.id, form)
    } else {
      ok = await addBusiness(form)
    }
    if (ok) {
      setPage(1)
    }
    return ok
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {isTransport ? <Truck size={16} color={accentColor} /> : <Wrench size={16} color={accentColor} />}
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Business Management · {isTransport ? 'Transport' : 'Garage'} Mode
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>
            {isTransport ? 'Transport Businesses' : 'Garage Businesses'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {isTransport ? 'Manage logistics & transport companies' : 'Manage garages & auto workshops'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: isTransport ? 'Transport Cos.' : 'Garages', val: businesses.length, color: accentColor, bg: accentLight },
          { label: 'Active', val: businesses.filter(b => b.status === 'Active').length, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Inactive', val: businesses.filter(b => b.status === 'Inactive').length, color: '#EF4444', bg: '#FEE2E2' },
          { label: 'Pending', val: businesses.filter(b => b.status === 'Pending').length, color: '#7C3AED', bg: '#EDE9FE' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '18px 20px', borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: c.color }}>{c.val}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="input-group" style={{ flex: 1, minWidth: 0 }}>
            <Search className="input-icon" size={18} />
            <input
              type="text" className="form-input" placeholder="Search by business name, owner, city..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft: 44, height: 44, width: '100%' }}
            />
          </div>
          <select 
            className="form-input" 
            style={{ height: 44, width: 160, fontWeight: 700, flexShrink: 0 }} 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Business', 'Owner', 'Location', 'GST No.', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(biz => (
                <tr key={biz.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: accentColor, fontSize: '0.9rem'
                      }}>{(biz.name || '?')[0].toUpperCase()}</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>{biz.name}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {biz.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.875rem', fontWeight: 700 }}>{formatName(biz.ownerName) || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      {biz.city && biz.city !== 'null' ? `${(biz.location && biz.location !== 'null') ? biz.location : ''} ${biz.city}`.trim() : (biz.location && biz.location !== 'null' ? biz.location : '—')}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.8125rem', fontFamily: 'monospace', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                    {(biz.gstNo && biz.gstNo !== 'null') ? biz.gstNo : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 99,
                      background: biz.status === 'Active' ? 'var(--success-light)' : biz.status === 'Pending' ? '#FEF3C7' : '#FEE2E2',
                      color: biz.status === 'Active' ? 'var(--success)' : biz.status === 'Pending' ? '#D97706' : 'var(--danger)'
                    }}>{biz.status}</span>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ color: accentColor }} 
                        onClick={() => handleViewHistory(biz)} 
                        title={isTransport ? "Trip History" : "Service History"}
                        disabled={loadingHistory}
                      >
                        {loadingHistory && history?.id === biz.id ? <Loader2 className="spin" size={14} /> : (isTransport ? <MapPin size={15} /> : <CreditCard size={15} />)}
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(biz)} title="Edit"><Edit3 size={15} /></button>
                      <button className="btn btn-sm btn-icon" onClick={() => deleteBusiness(biz.id)} style={{ color: 'var(--danger)', background: '#FEE2E2', border: 'none' }} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="6" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <Building2 size={44} color="var(--text-muted)" strokeWidth={1.5} style={{ margin: '0 auto 14px' }} />
                  <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text-secondary)' }}>No businesses registered</h3>
                  <p style={{ margin: '6px 0 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {businesses.length === 0 ? `No registered ${isTransport ? 'transport companies' : 'garages'} found` : 'Try adjusting your filters'}
                  </p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <b>{paginated.length}</b> of <b>{filtered.length}</b> businesses
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(i + 1)}
                style={page === i + 1 ? { background: accentColor, borderColor: accentColor } : {}}>
                {i + 1}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {modal && (
        <BusinessModal mode={mode} existing={modal !== 'add' ? modal : null} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {history && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-scaleIn" style={{ width: '100%', maxWidth: 650, padding: 0, overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 900 }}>{history.isTransport ? 'Trip History' : 'Service History'}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{history.name}</p>
              </div>
              <button className="btn-icon" onClick={() => setHistory(null)}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {!history.data || (history.data.trips?.length === 0 && history.data.bills?.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  {history.isTransport ? <Truck size={40} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 12 }} /> : <CreditCard size={40} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 12 }} />}
                  <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>No fresh data found for this business.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Bills Section */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Recent Invoices</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {history.data.bills.map(inv => (
                        <div key={inv.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{inv.id}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(inv.date).toLocaleDateString()}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, color: accentColor }}>₹{Number(inv.total).toLocaleString()}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: inv.status === 'paid' ? 'var(--success)' : 'var(--danger)', textTransform: 'uppercase' }}>{inv.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trips Section (Transport Only) */}
                  {history.isTransport && history.data.trips?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Recent Trips</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {history.data.trips.map(trip => (
                          <div key={trip.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                               <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{trip.vehicle}</div>
                               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(trip.date).toLocaleDateString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                               <div style={{ fontWeight: 900 }}>₹{Number(trip.amount).toLocaleString()}</div>
                               <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase' }}>{trip.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fleet Section */}
                  {history.data.vehicles?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                        {history.isTransport ? "Business Fleet" : "Registered Customer Vehicles"}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {history.data.vehicles.map(v => (
                          <div key={v.id} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{v.plateNo}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.type}{v.model ? ` · ${v.model}` : ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-alt)' }}>
              <button className="btn btn-primary btn-full" onClick={() => setHistory(null)}>Close History</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scaleIn { animation: scaleIn 0.25s cubic-bezier(0.16,1,0.3,1); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
