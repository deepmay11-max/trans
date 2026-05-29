import { useState, useEffect } from 'react'
import { Share2, Users, Loader2, AlertCircle, RefreshCw, Settings, Save } from 'lucide-react'
import { adminListReferrals, adminUpdateReferralStatus, adminGetReferralSettings, adminUpdateReferralSettings } from '../../api/adminApi'

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState({ maxUsers: 10, rewardAmount: 500, milestone: 1, tagline: '' })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')

  const fetchSettings = async () => {
    try {
      const res = await adminGetReferralSettings()
      if (res.success) {
        setSettings(res.settings)
      }
    } catch (err) {
      console.error('Failed to fetch referral settings:', err)
    }
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setSettingsMessage('')
    try {
      const res = await adminUpdateReferralSettings(settings)
      if (res.success) {
        setSettingsMessage('Settings updated successfully!')
        setTimeout(() => setSettingsMessage(''), 3000)
      } else {
        setError('Failed to update settings')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleMarkAsPaid = async (id) => {
    try {
      const res = await adminUpdateReferralStatus(id, 'rewarded')
      if (res.success) {
        fetchReferrals()
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
  }

  const fetchReferrals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminListReferrals()
      if (res.success) {
        setReferrals(res.referrals)
      } else {
        setError('Failed to load referrals')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="spin" size={32} color="#7C3AED" />
        <style>{`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  const validReferrals = referrals.filter(ref => ref.status === 'subscription_active' || ref.status === 'rewarded');
  
  const referrerStats = {};
  validReferrals.forEach(ref => {
    const rId = ref.referrer?._id;
    if (rId) {
      if (!referrerStats[rId]) referrerStats[rId] = { count: 0, amountDue: 0, totalAmount: 0 };
      referrerStats[rId].count += 1;
      referrerStats[rId].totalAmount += Number(settings.rewardAmount) || 0;
      if (ref.status === 'subscription_active') {
        referrerStats[rId].amountDue += Number(settings.rewardAmount) || 0;
      }
    }
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Share2 size={24} color="#7C3AED" /> Referral Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: 4 }}>
            View and track all user referrals across the platform.
          </p>
        </div>
        <button 
          onClick={fetchReferrals}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #E2E8F0',
            padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#475569'
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Settings Section */}
      <div style={{ 
        background: 'white', borderRadius: 16, padding: '20px', marginBottom: 24, 
        border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Settings size={20} color="#7C3AED" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Referral Settings</h3>
        </div>
        
        <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
              Max Referrals per User
            </label>
            <input 
              type="number"
              value={settings.maxUsers}
              onChange={(e) => setSettings({ ...settings, maxUsers: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
              placeholder="e.g. 10"
            />
          </div>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
              Reward Amount (₹)
            </label>
            <input 
              type="number"
              value={settings.rewardAmount}
              onChange={(e) => setSettings({ ...settings, rewardAmount: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
              placeholder="e.g. 500"
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
              Milestone (Min Referrals)
            </label>
            <input 
              type="number"
              value={settings.milestone}
              onChange={(e) => setSettings({ ...settings, milestone: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
              placeholder="e.g. 5"
            />
          </div>

          <div style={{ flex: '1 1 100%' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
              Referral Tagline (User Side)
            </label>
            <input 
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
              placeholder="e.g. You get cashback on 500 to share min 2"
            />
          </div>
          
          <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              type="submit"
              disabled={savingSettings}
              style={{ 
                background: '#7C3AED', color: 'white', border: 'none', padding: '10px 20px', 
                borderRadius: 10, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, opacity: savingSettings ? 0.7 : 1
              }}
            >
              {savingSettings ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
            
            {settingsMessage && (
              <span style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600 }}>{settingsMessage}</span>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626',
          padding: '12px 16px', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {validReferrals.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 16, padding: '60px 20px', textAlign: 'center',
          color: '#64748B', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <Users size={48} style={{ marginBottom: 16, opacity: 0.3, color: '#7C3AED' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>No Referrals Found</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>When users start referring, they will appear here.</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #F1F5F9',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Referrer</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Bank Details</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Referee</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {validReferrals.map((ref) => {
                  const bank = ref.referrer?.bankDetails;
                  const hasBank = bank && (bank.accountNumber || bank.upiId);
                  const stats = referrerStats[ref.referrer?._id] || { count: 0, totalAmount: 0 };
                  
                  return (
                    <tr key={ref._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>
                          {ref.referrer?.businessName || ref.referrer?.name || 'N/A'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                          {ref.referrer?.phone}
                        </span>
                        <div style={{ marginTop: 6, display: 'inline-block', background: '#F5F3FF', padding: '4px 8px', borderRadius: 6 }}>
                          <span style={{ fontSize: '0.7rem', color: '#7C3AED', fontWeight: 800 }}>
                            {stats.count} Referrals (Earned: ₹{stats.totalAmount})
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {hasBank ? (
                          <div style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4 }}>
                            {bank.accountNumber && (
                              <>
                                <span style={{ fontWeight: 600 }}>A/C:</span> {bank.accountNumber}<br />
                                <span style={{ fontWeight: 600 }}>IFSC:</span> {bank.ifsc}<br />
                              </>
                            )}
                            {bank.upiId && (
                              <>
                                <span style={{ fontWeight: 600 }}>UPI:</span> {bank.upiId}
                              </>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>No bank details</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>
                          {ref.referee?.businessName || ref.referee?.name || 'N/A'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {ref.referee?.phone}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                          background: ref.status === 'rewarded' ? '#ECFDF5' : (ref.status === 'subscription_active' ? '#EFF6FF' : (ref.status === 'pending_milestone' ? '#FFFBEB' : '#FEF3C7')),
                          color: ref.status === 'rewarded' ? '#10B981' : (ref.status === 'subscription_active' ? '#3B82F6' : (ref.status === 'pending_milestone' ? '#B45309' : '#D97706'))
                        }}>
                          {ref.status === 'rewarded' ? 'Paid' : (ref.status === 'subscription_active' ? 'Payout Due' : (ref.status === 'pending_milestone' ? 'Waiting Milestone' : 'Pending'))}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.8125rem', color: '#475569' }}>
                        {new Date(ref.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {ref.status !== 'rewarded' ? (
                            <button
                              onClick={() => handleMarkAsPaid(ref._id)}
                              style={{
                                background: '#DCFCE7', color: '#16A34A', border: 'none',
                                padding: '6px 12px', borderRadius: 8, fontSize: '0.7rem',
                                fontWeight: 800, cursor: 'pointer', transition: '0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#BBF7D0'}
                              onMouseLeave={e => e.currentTarget.style.background = '#DCFCE7'}
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await adminUpdateReferralStatus(ref._id, 'pending')
                                  if (res.success) fetchReferrals()
                                } catch (err) { setError(err.message) }
                              }}
                              style={{
                                background: '#FEE2E2', color: '#DC2626', border: 'none',
                                padding: '6px 12px', borderRadius: 8, fontSize: '0.7rem',
                                fontWeight: 800, cursor: 'pointer', transition: '0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                              onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
                            >
                              Mark Unpaid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
