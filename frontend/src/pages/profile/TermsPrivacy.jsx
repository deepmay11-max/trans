import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react'
import { usePageTranslation } from '../../hooks/usePageTranslation'

export default function TermsPrivacy() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'terms' // 'terms' or 'privacy'
  const navigate = useNavigate()
  
  const { getTranslatedText } = usePageTranslation([
    'Terms of Service', 'Privacy Policy', 'Back', 'Last updated: 01 Jan 2026',
    'Agreement', 'Data Protection', 'Contact Us', '1. Data Collection',
    '2. How We Use Data', '3. Data Security', '1. Acceptance of Terms',
    '2. User Responsibilities', '3. Subscription & Payments'
  ])

  const isPrivacy = type === 'privacy'
  const title = isPrivacy ? getTranslatedText('Privacy Policy') : getTranslatedText('Terms of Service')
  const Icon = isPrivacy ? ShieldCheck : FileText

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#64748B' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>{title}</h2>
      </div>

      <div className="card" style={{ padding: '32px 24px', borderRadius: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: isPrivacy ? '#F0F9FF' : '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon size={32} color={isPrivacy ? '#0EA5E9' : '#7C3AED'} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', marginBottom: 8 }}>{title}</h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>{getTranslatedText('Last updated: 01 Jan 2026')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, color: '#334155', lineHeight: 1.6, fontSize: '0.9375rem' }}>
          {isPrivacy ? (
            <>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{getTranslatedText('1. Data Collection')}</h3>
                <p>We collect information you provide directly to us, such as when you create an account, update your business profile, or contact customer support.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{getTranslatedText('2. How We Use Data')}</h3>
                <p>The information we collect is used to provide, maintain, and improve our billing and transport management services, and to communicate with you about updates and security alerts.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{getTranslatedText('3. Data Security')}</h3>
                <p>We use industry-standard encryption and security measures to protect your personal and business data from unauthorized access or disclosure.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{getTranslatedText('1. Acceptance of Terms')}</h3>
                <p>By accessing or using the Trans platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{getTranslatedText('2. User Responsibilities')}</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{getTranslatedText('3. Subscription & Payments')}</h3>
                <p>Access to certain features requires an active subscription. Payments are processed securely via third-party providers and are non-refundable unless otherwise specified.</p>
              </section>
            </>
          )}
          
          <div style={{ marginTop: 12, padding: 20, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Questions? Contact our support team</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#7C3AED' }}>support@transbilling.in</p>
          </div>
        </div>
      </div>
    </div>
  )
}
