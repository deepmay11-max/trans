import { Outlet } from 'react-router-dom'
import { FileText } from 'lucide-react'
import logo from '../assets/trans-logo.png'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Left panel — branding (desktop only) */}
      <div className="auth-left">

        {/* Logo */}
        <div style={{
          width: 84, height: 84, borderRadius: 24, overflow: 'hidden',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative', zIndex: 1
        }}>
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Brand name */}
        <h1 style={{
          color: 'white', fontSize: '2.5rem', fontWeight: 900,
          marginBottom: 8, position: 'relative', zIndex: 1, textAlign: 'center',
          letterSpacing: '-0.03em'
        }}>
          TRANS
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)', fontSize: '1rem',
          textAlign: 'center', maxWidth: 280,
          position: 'relative', zIndex: 1
        }}>
          Smart billing for Transporters & Garage Owners
        </p>

        {/* Feature pills */}
        <div style={{
          marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12,
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 300
        }}>
          {[
            { emoji: '⚡', text: 'Create bills in seconds' },
            { emoji: '📱', text: 'Share via WhatsApp instantly' },
            { emoji: '📊', text: 'Track payments & reports' },
            { emoji: '🚛', text: 'Transport & Garage billing' },
          ].map((f, i) => (
            <div
              key={i}
              className="animate-fadeInUp"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, padding: '12px 16px',
                animationDelay: `${i * 0.08}s`
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{f.emoji}</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — actual auth form */}
      <div className="auth-right">
        <div className="auth-card animate-fadeIn">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
