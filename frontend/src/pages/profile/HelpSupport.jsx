import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, 
  ChevronDown, ChevronUp, ExternalLink, ShieldCheck 
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          width: '100%', background: 'none', border: 'none', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left', padding: 0
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', paddingRight: 12 }}>{question}</span>
        {open ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
      </button>
      {open && (
        <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '12px 0 0' }}>
          {answer}
        </p>
      )}
    </div>
  )
}

export default function HelpSupport() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSupport = (type) => {
    let url = ''
    if (type === 'wa') url = `https://wa.me/919999999999?text=${encodeURIComponent("Hello! I need help with the Trans app.")}`
    if (type === 'call') url = `tel:+919999999999`
    if (type === 'mail') url = `mailto:support@example.com`
    window.open(url, '_blank')
  }

  const faqs = [
    { q: t('faq_1_q'), a: t('faq_1_a') },
    { q: t('faq_2_q'), a: t('faq_2_a') },
    { q: t('faq_3_q'), a: t('faq_3_a') },
    { q: t('faq_4_q'), a: t('faq_4_a') },
    { q: t('faq_5_q'), a: t('faq_5_a') },
  ]

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/profile')} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280'
        }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', margin: 0 }}>{t('help_support')}</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{t('help_support_sub')}</p>
        </div>
      </div>

      {/* Support Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => handleSupport('wa')}
          style={{ 
            background: 'white', borderRadius: 20, padding: '20px', 
            border: '1px solid #DCFCE7', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.05)' 
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={22} color="#16A34A" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#16A34A' }}>{t('whatsapp_chat')}</span>
        </button>

        <button 
          onClick={() => handleSupport('call')}
          style={{ 
            background: 'white', borderRadius: 20, padding: '20px', 
            border: '1px solid #DBEAFE', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)' 
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={22} color="#2563EB" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#2563EB' }}>{t('call_support')}</span>
        </button>
      </div>

      <button 
        onClick={() => handleSupport('mail')}
        style={{ 
          width: '100%', background: 'white', borderRadius: 20, padding: '16px 20px', 
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', 
          gap: 14, cursor: 'pointer', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mail size={18} color="#64748B" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('email_support')}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>support@example.com</div>
        </div>
        <ExternalLink size={16} color="var(--text-muted)" />
      </button>

      {/* FAQs */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={20} color="var(--primary)" /> {t('frequently_asked_questions')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#F0FDF4', borderRadius: 99, color: '#16A34A', fontSize: '0.75rem', fontWeight: 800 }}>
          <ShieldCheck size={14} /> Secure & Private
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 12 }}>Version 2.4.0 (Stable)</p>
      </div>
    </div>
  )
}
