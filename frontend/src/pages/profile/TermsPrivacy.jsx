import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, ShieldCheck, FileText, Lock, Eye, 
  Globe, Info, CheckCircle2, User, CreditCard,
  ExternalLink, Mail
} from 'lucide-react'
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
    '4. Intellectual Property', '5. Limitation of Liability', '6. Governing Law',
    'Questions? Contact our support team', 'support@transbilling.in'
  ])

  const isPrivacy = type === 'privacy'
  const title = isPrivacy ? getTranslatedText('Privacy Policy') : getTranslatedText('Terms of Service')
  const Icon = isPrivacy ? ShieldCheck : FileText
  const themeColor = isPrivacy ? '#0EA5E9' : '#7C3AED'
  const bgGradient = isPrivacy 
    ? 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)' 
    : 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'

  return (
    <div className="terms-container animate-fadeIn" style={{ 
      minHeight: '100vh', 
      background: bgGradient,
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Background blobs for depth */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: themeColor, opacity: 0.05, borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '30vw', height: '30vw', background: themeColor, opacity: 0.04, borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }} />

      <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Navigation / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <button 
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/login')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', 
              borderRadius: '14px', border: 'none', background: 'white', 
              color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: '0.2s' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(-4px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft size={18} /> {getTranslatedText('Back')}
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => navigate(isPrivacy ? '/terms?type=terms' : '/privacy?type=privacy')}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#64748B' }}
            >
              {isPrivacy ? getTranslatedText('Terms of Service') : getTranslatedText('Privacy Policy')}
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="glass-card" style={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          {/* Card Header Banner */}
          <div style={{ 
            padding: '60px 40px', 
            background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`,
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ 
              width: 80, height: 80, borderRadius: '24px', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <Icon size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 950, margin: '0 0 10px', letterSpacing: '-0.03em' }}>{title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.9, fontSize: '0.875rem', fontWeight: 600 }}>
              <Info size={16} /> {getTranslatedText('Last updated: 01 May 2026')}
            </div>
          </div>

          {/* Main Body */}
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {isPrivacy ? (
                <>
                  <Section title={getTranslatedText('1. Data Collection')} icon={Info} color={themeColor}>
                    We collect information you provide directly to us, such as when you create an account, update your business profile, or contact customer support. This includes your name, phone number, business GSTIN, and location data required for transport logging.
                  </Section>
                  <Section title={getTranslatedText('2. How We Use Data')} icon={Eye} color={themeColor}>
                    The information we collect is used to provide, maintain, and improve our billing and transport management services. We use location data to facilitate trip tracking and ensure accurate billing for distance traveled.
                  </Section>
                  <Section title={getTranslatedText('3. Data Security')} icon={Lock} color={themeColor}>
                    We use industry-standard encryption and security measures to protect your personal and business data. Your data is stored on secure cloud servers with restricted access controls.
                  </Section>
                  <Section title={getTranslatedText('4. Third-Party Sharing')} icon={Globe} color={themeColor}>
                    We do not sell your personal data. We may share information with verified payment processors like Razorpay to facilitate subscription payments and with SMS gateways for OTP authentication.
                  </Section>
                </>
              ) : (
                <>
                  <Section title={getTranslatedText('1. Acceptance of Terms')} icon={CheckCircle2} color={themeColor}>
                    By accessing or using the Trans platform, you agree to be bound by these Terms of Service and all applicable laws and regulations in the jurisdiction of India. If you do not agree, please discontinue use.
                  </Section>
                  <Section title={getTranslatedText('2. User Responsibilities')} icon={User} color={themeColor}>
                    Users must provide accurate business information. You are solely responsible for the legality of the invoices generated through our platform and for compliance with local tax (GST) regulations.
                  </Section>
                  <Section title={getTranslatedText('3. Subscription & Payments')} icon={CreditCard} color={themeColor}>
                    Subscriptions are billed on a yearly basis. All payments are non-refundable. Trans reserves the right to modify pricing with 30 days notice to active subscribers.
                  </Section>
                  <Section title={getTranslatedText('4. Intellectual Property')} icon={ShieldCheck} color={themeColor}>
                    All logos, software code, and design elements are the property of Trans. Users are granted a limited license to use the platform for business billing purposes only.
                  </Section>
                </>
              )}
            </div>

            {/* Support Footer */}
            <div style={{ 
              marginTop: 48, padding: '30px', borderRadius: '24px', 
              background: `${themeColor}08`, border: `1px solid ${themeColor}15`,
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: `${themeColor}15`, color: themeColor, marginBottom: 16 }}>
                <Mail size={24} />
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>{getTranslatedText('Questions? Contact our support team')}</h4>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: themeColor }}>{getTranslatedText('support@transbilling.in')}</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>
          &copy; 2026 TRANS Billing Solutions. All rights reserved.
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .section-hover:hover {
          background: rgba(255,255,255,0.5);
          transform: translateX(10px);
        }
      `}</style>
    </div>
  )
}

function Section({ title, icon: Icon, color, children }) {
  return (
    <section className="section-hover" style={{ 
      padding: '20px', borderRadius: '16px', transition: 'all 0.3s ease',
      border: '1px solid transparent'
    }}>
      <h3 style={{ 
        fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', 
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 
      }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: '10px', background: `${color}15`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: color 
        }}>
          <Icon size={20} />
        </div>
        {title}
      </h3>
      <div style={{ 
        color: '#475569', fontSize: '1rem', lineHeight: 1.7, 
        paddingLeft: 48, fontWeight: 500 
      }}>
        {children}
      </div>
    </section>
  )
}
