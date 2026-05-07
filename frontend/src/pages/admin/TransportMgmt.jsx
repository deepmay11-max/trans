import React, { useState } from 'react'
import { 
  Truck, Search, Filter, MoreVertical, 
  MapPin, Calendar, CreditCard, Plus,
  Edit3, Trash2, Eye, Download, ArrowLeft,
  ChevronRight, Building2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TransportMgmt() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('Businesses')
  const [showAddModal, setShowAddModal] = useState(false)

  // Mock data for transport businesses
  const [transportUsers, setTransportUsers] = useState([])

  const [recentBills, setRecentBills] = useState([])

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <div style={{ width: 56, height: 56, borderRadius: 20, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={28} color="#F3811E" />
           </div>
           <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>Transport Management</h1>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Full control over logistics partners and consolidated billing</p>
           </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="btn btn-ghost"><Download size={18} /> Export Data</button>
           <button className="btn btn-primary" style={{ background: '#F3811E', borderColor: '#F3811E' }} onClick={() => setShowAddModal(true)}>
             <Plus size={18} /> Add New Business
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Businesses', val: '0', icon: Building2, color: '#F3811E', bg: '#FFF7ED' },
          { label: 'Total Trips', val: '0', icon: MapPin, color: '#8B5CF6', bg: '#F5F3FF' },
          { label: 'Revenue Generated', val: '₹0', icon: CreditCard, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Pending Bills', val: '0', icon: Calendar, color: '#EF4444', bg: '#FEF2F2' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
             <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <s.icon size={20} color={s.color} />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{s.val}</div>
             <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
         {['Businesses', 'All Bills', 'Trip Analytics'].map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             style={{ 
               padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
               fontSize: '0.9rem', fontWeight: 800, color: activeTab === tab ? '#F3811E' : '#9CA3AF',
               borderBottom: activeTab === tab ? '3px solid #F3811E' : '3px solid transparent',
               transition: '0.2s'
             }}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeTab === 'Businesses' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
           <div style={{ padding: '20px 24px', background: '#F9FAFB', display: 'flex', gap: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                 <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                 <input 
                   className="form-input" placeholder="Search business, owner or location..." 
                   style={{ paddingLeft: 44, borderRadius: 16, background: 'white' }}
                   value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <button className="btn btn-ghost" style={{ borderRadius: 16 }}><Filter size={18} /> Filters</button>
           </div>
           
           <div style={{ overflowX: 'auto' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead style={{ background: '#F9FAFB' }}>
                 <tr>
                    {['Business', 'Owner', 'Location', 'Trips', 'Revenue', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                 </tr>
               </thead>
               <tbody>
                  {transportUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #F3F4F6', transition: '0.2s' }}>
                       <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>ID: {user.id}00AB</div>
                       </td>
                       <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#4B5563' }}>{user.owner}</td>
                       <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                             <MapPin size={14} color="#9CA3AF" /> {user.location}
                          </div>
                       </td>
                       <td style={{ padding: '16px 24px', fontWeight: 700 }}>{user.trips}</td>
                       <td style={{ padding: '16px 24px', fontWeight: 900 }}>₹{user.revenue.toLocaleString()}</td>
                       <td style={{ padding: '16px 24px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800,
                            background: user.status === 'Active' ? '#DCFCE7' : '#F3F4F6',
                            color: user.status === 'Active' ? '#059669' : '#6B7280'
                          }}>
                            {user.status}
                          </span>
                       </td>
                       <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                             <button className="btn-icon sm" title="Edit"><Edit3 size={16} /></button>
                             <button className="btn-icon sm" style={{ color: '#EF4444', background: '#FEF2F2' }} title="Delete"><Trash2 size={16} /></button>
                             <button className="btn-icon sm" title="Manage"><Eye size={16} /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'All Bills' && (
        <div className="card" style={{ padding: 24 }}>
           <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 20 }}>System-wide Transport Invoices</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentBills.map(bill => (
                <div key={bill.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: '#F9FAFB', borderRadius: 20 }}>
                   <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} color="#F3811E" />
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{bill.business}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{bill.id} • {dayjs(bill.date).format('DD MMM, YYYY')}</div>
                   </div>
                   <div style={{ textAlign: 'center', padding: '0 24px', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{bill.trips} Trips</div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Consolidated</div>
                   </div>
                   <div style={{ textAlign: 'right', minWidth: 100 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>₹{bill.amount.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: bill.status === 'Paid' ? '#059669' : '#EF4444' }}>{bill.status}</div>
                   </div>
                   <button className="btn-icon"><ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} /></button>
                </div>
              ))}
           </div>
        </div>
      )}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 24 }}>Onboard Transport Business</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">BUSINESS NAME</label>
                <input type="text" className="form-input" placeholder="e.g. Rahul Logistics" />
              </div>
              <div className="form-group">
                <label className="form-label">OWNER NAME</label>
                <input type="text" className="form-input" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="form-group">
                <label className="form-label">LOCATION</label>
                <input type="text" className="form-input" placeholder="City / Area" />
              </div>
              <div className="form-group">
                <label className="form-label">GST NUMBER</label>
                <input 
                  type="text" className="form-input" placeholder="e.g. 27AAAAA0000A1Z5" 
                  style={{ textTransform: 'uppercase' }}
                  onChange={e => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15)
                  }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '0.62rem', color: '#9CA3AF', fontWeight: 500 }}>
                  Standard 15-digit GSTIN format
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-full" style={{ background: '#F3811E' }} onClick={() => setShowAddModal(false)}>Register</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
