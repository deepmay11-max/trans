import React, { useState } from 'react'
import { 
  Plus, Edit, Trash2, Calendar, 
  Eye, Image as ImageIcon, CheckCircle, 
  XCircle, ArrowUpRight, TrendingUp, Clock, Megaphone,
  BarChart3, Target, MousePointer2, X, Upload
} from 'lucide-react'

export default function AdManager() {
  const [activeTab, setActiveTab] = useState('All')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Replaced with empty state for production readiness
  const [ads, setAds] = useState([])

  const [newAd, setNewAd] = useState({ title: '', type: 'Banner', location: 'Dashboard', audience: 'All Users', expires: '' })

  const metrics = [
    { label: 'System Impressions', value: '0', icon: Eye, color: '#6366F1', bg: '#EEF2FF', change: '0%' },
    { label: 'Engagement (Clicks)', value: '0', icon: MousePointer2, color: '#10B981', bg: '#ECFDF5', change: '0%' },
    { label: 'Avg conversion Rate', value: '0%', icon: TrendingUp, color: '#7C3AED', bg: '#EDE9FE', change: '0%' },
  ]

  const tabs = ['All', 'Active', 'Paused', 'Draft']

  const filteredAds = ads.filter(ad => activeTab === 'All' || ad.status === activeTab)

  const handleCreateAd = (e) => {
    e.preventDefault()
    const adToAdd = {
      id: ads.length + 1,
      ...newAd,
      status: 'Active',
      clicks: 0,
      impressions: 0,
      budget: '₹0'
    }
    setAds([adToAdd, ...ads])
    setShowCreateModal(false)
    setNewAd({ title: '', type: 'Banner', location: 'Dashboard', audience: 'All Users', expires: '' })
  }

  const deleteAd = (id) => {
    setAds(prev => prev.filter(ad => ad.id !== id))
  }

  return (
    <div className="animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
             <Target size={18} color="var(--primary)" />
             <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Campaign Management</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Advertisement Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage promotional material and system-wide broadcast campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Launch New Campaign
        </button>
      </div>

      {/* ── Metrics Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
        {metrics.map((m, idx) => (
          <div key={idx} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={26} color={m.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{m.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '2px 0 0' }}>{m.value}</h2>
                 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>{m.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 2.2fr', gap: 24, marginBottom: 32 }}>
        {/* Ad Preview / Quick Actions */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Campaign Toolbox</h3>
          <div style={{ 
            aspectRatio: '16/9', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed var(--border)', color: 'var(--text-muted)', gap: 16, transition: 'var(--transition)',
            cursor: 'pointer'
          }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ 
              width: 54, height: 54, borderRadius: '50%', background: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)'
            }}>
              <Upload size={24} color="var(--primary)" />
            </div>
            <div style={{ textAlign: 'center' }}>
               <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Upload Creative</p>
               <p style={{ margin: 0, fontSize: '0.75rem' }}>PNG, JPG, SVG up to 2MB</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
               <label className="form-label">BROADCAST SCHEDULE</label>
               <button className="btn btn-ghost btn-full" style={{ justifyContent: 'flex-start', paddingLeft: 16 }}>
                  <Calendar size={18} style={{ marginRight: 8 }} /> Select Date Range
               </button>
            </div>
            <div className="form-group">
               <label className="form-label">TARGET MODULE</label>
               <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, padding: 8, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, background: 'var(--bg)' }}>Transport</div>
                  <div style={{ flex: 1, padding: 8, borderRadius: 10, border: '2px solid var(--primary)', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-lighter)' }}>Garage</div>
               </div>
            </div>
            <button className="btn btn-primary btn-full"><Megaphone size={18} /> Schedule Broadcast</button>
          </div>
        </div>

        {/* Existing Campaigns List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Active Campaigns</h3>
               <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Real-time performance of your live ads</p>
            </div>
            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--border)' }}>
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '6px 14px', border: 'none', background: activeTab === t ? 'white' : 'transparent',
                    color: activeTab === t ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700,
                    fontSize: '0.75rem', borderRadius: 8, cursor: 'pointer', transition: 'var(--transition)',
                    boxShadow: activeTab === t ? 'var(--shadow-xs)' : 'none'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Campaign / Type</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Metrics</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAds.map(ad => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{ad.title}</p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                         <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{ad.type}</span>
                         <span className="badge" style={{ fontSize: '0.625rem', background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>{ad.location}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <Eye size={12} color="var(--text-muted)" />
                           <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{ad.impressions.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <MousePointer2 size={12} color="var(--text-muted)" />
                           <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ad.clicks} clicks ({((ad.clicks/(ad.impressions||1))*100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800,
                        color: ad.status === 'Active' ? 'var(--success)' : 'var(--warning)', 
                        background: ad.status === 'Active' ? 'var(--success-light)' : 'var(--warning-light)',
                        padding: '4px 12px', borderRadius: 99
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: ad.status === 'Active' ? 'var(--success)' : 'var(--warning)' }} />
                        {ad.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {ad.budget}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button className="btn btn-icon btn-sm"><Edit size={18} /></button>
                        <button className="btn btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteAd(ad.id)}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
             <Clock size={16} color="var(--text-muted)" />
             <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Next scheduled cycle starts in 04:12:45</span>
          </div>
        </div>
      </div>

      {/* ── Create Ad Modal ── */}
      {showCreateModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 21, 60, 0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="card animate-scaleIn" style={{ width: '100%', maxWidth: 540, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-dark)', color: 'white' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 900, color: 'white' }}>Launch Campaign</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Define your promotional strategy</p>
              </div>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)} style={{ color: 'white' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAd} style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="form-group">
                  <label className="form-label">CAMPAIGN TITLE</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Premium Subscription Launch" 
                    required
                    value={newAd.title}
                    onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                  />
                </div>
                
                <div className="responsive-grid" style={{ gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">AD TYPE</label>
                    <select className="form-input" value={newAd.type} onChange={e => setNewAd({ ...newAd, type: e.target.value })}>
                       <option>Banner</option>
                       <option>Popup</option>
                       <option>Sidebar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">PLACEMENT</label>
                    <select className="form-input" value={newAd.location} onChange={e => setNewAd({ ...newAd, location: e.target.value })}>
                       <option>Dashboard</option>
                       <option>Auth Pages</option>
                       <option>Universal</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">TARGET AUDIENCE</label>
                  <select className="form-input" value={newAd.audience} onChange={e => setNewAd({ ...newAd, audience: e.target.value })}>
                     <option>All Users</option>
                     <option>Transport Owners Only</option>
                     <option>Garage Managers Only</option>
                     <option>Unverified Users</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">EXPIRATION DATE</label>
                  <div className="input-group">
                    <Calendar className="input-icon" size={18} />
                    <input 
                      type="date" 
                      className="form-input" 
                      required
                      value={newAd.expires}
                      onChange={e => setNewAd({ ...newAd, expires: e.target.value })}
                      style={{ paddingLeft: 44 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowCreateModal(false)}>Discard</button>
                <button type="submit" className="btn btn-primary btn-full shadow-lg">Activate Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background: rgba(124, 58, 237, 0.02);
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .responsive-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
        * { -webkit-overflow-scrolling: touch; }
      `}</style>
    </div>
  )
}
