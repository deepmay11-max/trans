import { useState, useEffect } from 'react'
import { Share2, Copy, Check, Users, Award, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { getReferralStats } from '../../api/referralApi'
import { Link, useNavigate } from 'react-router-dom'
import { usePageTranslation } from '../../hooks/usePageTranslation'

export default function ShareAndEarn() {
  const { getTranslatedText } = usePageTranslation([
    'Share & Earn', 'Invite your friends to use Trans and earn rewards when they subscribe!',
    'Your Referral Code', 'Share on WhatsApp', 'Update your bank details to receive rewards.',
    'Bank Details', 'Total Referred', 'Total Earned', 'Referred Friends', 'No referrals yet',
    'Joined on', 'Rewarded', 'Reward Pending', 'Milestone Reward', 'Invite', 'friends to unlock', 'cashback for each!',
    'Payout Due', 'Waiting Milestone', 'New User'
  ])
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getReferralStats()
        if (res.success) {
          setStats(res)
        } else {
          setError('Failed to load referral stats')
        }
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const copyToClipboard = () => {
    if (!stats?.referralCode) return
    navigator.clipboard.writeText(stats.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnWhatsApp = () => {
    if (!stats?.referralCode) return
    const message = `Join TRANS using my referral code *${stats.referralCode}* and manage your fleet and invoices easily!\n\nDownload App:\nAndroid: https://play.google.com/store/apps/details?id=com.company.transbilling\niOS: https://apps.apple.com/in/app/trans-billing/id6767125245`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank')
  }

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

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={40} style={{ marginBottom: 10 }} />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
      {/* Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button 
          onClick={handleBack} 
          style={{ 
            width: 36, 
            height: 36, 
            borderRadius: 10, 
            border: 'none', 
            background: 'rgba(0,0,0,0.06)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#6B7280',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%)',
        color: 'white',
        borderRadius: 24,
        padding: '36px 24px',
        boxShadow: '0 20px 30px rgba(139, 92, 246, 0.3)',
        marginBottom: 24,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        
        <h2 style={{ fontSize: '1.85rem', fontWeight: 950, marginBottom: 8, letterSpacing: '-0.03em', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {getTranslatedText('Share & Earn')}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.95)', fontWeight: 600, maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
          {stats?.tagline ? getTranslatedText(stats.tagline) : getTranslatedText('Invite your friends to use Trans and earn rewards when they subscribe!')}
        </p>
      </div>

      {/* Referral Code Section */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '24px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.04)',
        marginBottom: 24,
        border: '1px solid #F1F5F9',
        textAlign: 'center',
        position: 'relative'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 850, color: '#64748B', letterSpacing: '0.12em', display: 'block', marginBottom: 16 }}>
          {getTranslatedText('Your Referral Code')}
        </span>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)',
          border: '2px dashed #CBD5E1',
          borderRadius: 16,
          padding: '16px 24px',
          marginBottom: 24,
          position: 'relative'
        }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 950, color: '#0F172A', letterSpacing: '0.05em' }}>
            {stats?.referralCode}
          </span>
          <button 
            onClick={copyToClipboard}
            style={{
              background: copied ? '#ECFDF5' : '#EEF2FF',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#10B981' : '#6366F1',
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            title="Copy Code"
          >
            {copied ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2.5} />}
          </button>
        </div>

        <button
          onClick={shareOnWhatsApp}
          className="whatsapp-btn"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 16,
            padding: '16px',
            fontSize: '1rem',
            fontWeight: 850,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 10px 20px rgba(37, 211, 102, 0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          <Share2 size={20} strokeWidth={2.5} /> {getTranslatedText('Share on WhatsApp')}
        </button>
      </div>

      {/* Bank Details Notice */}
      <div style={{
        background: '#FEF3C7',
        border: '1px solid #FCD34D',
        borderRadius: 16,
        padding: '12px 16px',
        marginBottom: 24,
        fontSize: '0.8125rem',
        color: '#92400E',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <AlertCircle size={18} strokeWidth={2.5} />
        <div>
          {getTranslatedText('Update your bank details to receive rewards.')} <Link to="/profile/bank" style={{ color: '#7C3AED', fontWeight: 700, textDecoration: 'underline' }}>{getTranslatedText('Bank Details')}</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '20px 16px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 8px 15px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            <Users size={24} strokeWidth={2.2} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: 2 }}>{getTranslatedText('Total Referred')}</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 950, color: '#0F172A' }}>{stats?.referrals?.length || 0}</span>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '20px 16px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 8px 15px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <Award size={24} strokeWidth={2.2} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: 2 }}>{getTranslatedText('Total Earned')}</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 950, color: '#10B981' }}>₹{stats?.totalEarned || 0}</span>
          </div>
        </div>
      </div>

      {/* Milestone Progress Section */}
      {stats?.milestone > 1 && (
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 24,
          border: '1px solid #F1F5F9',
          boxShadow: '0 8px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>{getTranslatedText('Milestone Reward')}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '4px 10px', borderRadius: 99 }}>
              {stats?.referrals?.filter(r => r.status === 'pending_milestone').length || 0} / {stats?.milestone}
            </span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ 
              width: `${Math.min(100, ((stats?.referrals?.filter(r => r.status === 'pending_milestone').length || 0) / stats?.milestone) * 100)}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #7C3AED 0%, #D946EF 100%)',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 10, fontWeight: 600 }}>
            {stats?.tagline ? getTranslatedText(stats.tagline) : (
              <>{getTranslatedText('Invite')} {stats?.milestone} {getTranslatedText('friends to unlock')} ₹{stats?.rewardAmount || 500} {getTranslatedText('cashback for each!')}</>
            )}
          </p>
        </div>
      )}

      {/* Referred Users List */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0F172A', marginBottom: 16, letterSpacing: '-0.02em' }}>
          {getTranslatedText('Referred Friends')}
        </h3>

        {stats?.referrals?.length === 0 ? (
          <div style={{
            background: '#F8FAFC',
            borderRadius: 20,
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748B',
            border: '1px dashed #E2E8F0'
          }}>
            <p style={{ margin: 0, fontWeight: 750, fontSize: '0.9rem' }}>{getTranslatedText('No referrals yet')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats?.referrals?.map((ref) => (
              <div key={ref._id} style={{
                background: 'white',
                borderRadius: 16,
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #F1F5F9',
                boxShadow: '0 4px 6px rgba(0,0,0,0.01)'
              }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                      {ref.referee?.businessName || ref.referee?.name || getTranslatedText('New User')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      {getTranslatedText('Joined on')}: {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: ref.status === 'rewarded' ? '#ECFDF5' : (ref.status === 'subscription_active' ? '#EFF6FF' : (ref.status === 'pending_milestone' ? '#FFFBEB' : '#FEF3C7')),
                  color: ref.status === 'rewarded' ? '#10B981' : (ref.status === 'subscription_active' ? '#3B82F6' : (ref.status === 'pending_milestone' ? '#B45309' : '#D97706')),
                  letterSpacing: '0.02em'
                }}>
                  {ref.status === 'rewarded' ? getTranslatedText('Rewarded') : (ref.status === 'subscription_active' ? getTranslatedText('Payout Due') : (ref.status === 'pending_milestone' ? getTranslatedText('Waiting Milestone') : getTranslatedText('Reward Pending')))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .whatsapp-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  )
}
