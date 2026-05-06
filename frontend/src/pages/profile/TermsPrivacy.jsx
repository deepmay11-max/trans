import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, FileText, Lock, Eye, Globe, Info, CheckCircle2, User, CreditCard } from 'lucide-react'
import { usePageTranslation } from '../../hooks/usePageTranslation'

export default function TermsPrivacy() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || (pathname.includes('privacy') ? 'privacy' : 'terms')
  const navigate = useNavigate()
  
  const { getTranslatedText } = usePageTranslation([
    'Terms of Service', 'Privacy Policy', 'Back', 'Last updated: 01 May 2026',
    'Agreement', 'Data Protection', 'Contact Us', '1. Data Collection',
    '2. How We Use Data', '3. Data Security', '4. Third-Party Sharing', '5. Your Rights',
    '1. Acceptance of Terms', '2. User Responsibilities', '3. Subscription & Payments',
    '4. Intellectual Property', '5. Limitation of Liability', '6. Governing Law'
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
          <p style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>{getTranslatedText('Last updated: 01 May 2026')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, color: '#334155', lineHeight: 1.6, fontSize: '0.9375rem' }}>
          {isPrivacy ? (
            <>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Info size={18} color="#0EA5E9" /> {getTranslatedText('1. Data Collection')}
                </h3>
                <p>We collect information you provide directly to us, such as when you create an account, update your business profile, or contact customer support. This includes your name, phone number, business GSTIN, and location data required for transport logging.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Eye size={18} color="#0EA5E9" /> {getTranslatedText('2. How We Use Data')}
                </h3>
                <p>The information we collect is used to provide, maintain, and improve our billing and transport management services. We use location data to facilitate trip tracking and ensure accurate billing for distance traveled.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Lock size={18} color="#0EA5E9" /> {getTranslatedText('3. Data Security')}
                </h3>
                <p>We use industry-standard encryption and security measures to protect your personal and business data. Your data is stored on secure cloud servers with restricted access controls.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Globe size={18} color="#0EA5E9" /> {getTranslatedText('4. Third-Party Sharing')}
                </h3>
                <p>We do not sell your personal data. We may share information with verified payment processors like Razorpay to facilitate subscription payments and with SMS gateways for OTP authentication.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <CheckCircle2 size={18} color="#7C3AED" /> {getTranslatedText('1. Acceptance of Terms')}
                </h3>
                <p>By accessing or using the Trans platform, you agree to be bound by these Terms of Service and all applicable laws and regulations in the jurisdiction of India. If you do not agree, please discontinue use.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <User size={18} color="#7C3AED" /> {getTranslatedText('2. User Responsibilities')}
                </h3>
                <p>Users must provide accurate business information. You are solely responsible for the legality of the invoices generated through our platform and for compliance with local tax (GST) regulations.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <CreditCard size={18} color="#7C3AED" /> {getTranslatedText('3. Subscription & Payments')}
                </h3>
                <p>Subscriptions are billed on a yearly basis. All payments are non-refundable. Trans reserves the right to modify pricing with 30 days notice to active subscribers.</p>
              </section>
              <section>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <ShieldCheck size={18} color="#7C3AED" /> {getTranslatedText('4. Intellectual Property')}
                </h3>
                <p>All logos, software code, and design elements are the property of Trans. Users are granted a limited license to use the platform for business billing purposes only.</p>
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
