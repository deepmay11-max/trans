import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, RefreshCw, Check, Gift } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const OTP_LENGTH = 6
const RESEND_TIMEOUT = 30

export default function OTPVerify() {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(RESEND_TIMEOUT)
  const [resending, setResending] = useState(false)
  const [localError, setLocalError] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOTP, sendOTP, logout, verifying, error } = useAuth()

  const phone = location.state?.phone || localStorage.getItem('temp_login_phone') || ''
  const isNewUser = location.state?.isNewUser ?? (localStorage.getItem('temp_is_new_user') === 'true')

  // If no phone, redirect to login
  useEffect(() => {
    if (!phone) navigate('/login', { replace: true })
  }, [phone, navigate])

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  // Focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleOtpChange = (val) => {
    const digitOnly = val.replace(/\D/g, '').slice(0, OTP_LENGTH)
    setOtp(digitOnly)
    if (localError) setLocalError('')

    // Auto-verify if 6 digits entered
    if (digitOnly.length === OTP_LENGTH) {
      handleVerify(digitOnly)
    }
  }

  const handleVerify = useCallback(async (otpStr) => {
    const code = otpStr || otp
    if (code.length < OTP_LENGTH) {
      setLocalError(`Please enter the ${OTP_LENGTH}-digit OTP`)
      return
    }
    const res = await verifyOTP(phone, code)
    if (res.success) {
      if (res.isNewUser) {
        navigate('/referral-setup', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } else {
      setLocalError(res.message || 'Invalid OTP. Please check and try again.')
      setOtp('')
      inputRef.current?.focus()
    }
  }, [otp, phone, verifyOTP, navigate])

  const handleResend = async () => {
    setResending(true)
    setOtp('')
    setLocalError('')
    inputRef.current?.focus()
    await sendOTP(phone)
    setTimer(RESEND_TIMEOUT)
    setResending(false)
  }

  const displayPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : ''

  const displayError = localError || error
  const isOtpError = displayError && !displayError?.toLowerCase().includes('referral')

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 440, margin: '0 auto', paddingBottom: isFocused ? '40vh' : 20, transition: 'padding 0.3s ease' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 20, background: '#F5F3FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.1)', position: 'relative'
        }}>
          <ShieldCheck size={28} color="#7C3AED" strokeWidth={2.5} />
          <div style={{
            position: 'absolute', bottom: -4, right: -4, width: 22, height: 22,
            borderRadius: '50%', background: '#7C3AED', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'white', border: '3px solid white'
          }}>
            <Check size={12} strokeWidth={4} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Verify OTP
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: '#1E293B', fontSize: '0.9375rem' }}>{displayPhone}</strong>
        </p>
      </div>

      {/* Form Card */}
      <div className="otp-card" style={{
        background: 'white', padding: '24px 20px', borderRadius: 28,
        border: '1px solid #F1F5F9', boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
        margin: '0 10px'
      }}>
        {/* Single OTP Input (Hidden but functional for Autofill) */}
        <div className="form-group" style={{ marginBottom: 28, textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'relative', maxWidth: 260, margin: '0 auto' }}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={OTP_LENGTH}
              value={otp}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={e => handleOtpChange(e.target.value)}
              autoComplete="one-time-code"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                zIndex: 10,
                cursor: 'default',
                fontSize: '16px', // Prevents iOS zoom
                color: 'transparent',
                background: 'transparent',
                caretColor: 'transparent',
                border: 'none',
                outline: 'none',
                padding: 0,
                margin: 0
              }}
            />

            {/* Visual 6-Box UI */}
            <div className="otp-input-container" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 5,
              position: 'relative',
              zIndex: 5
            }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="otp-input-box"
                  style={{
                    width: 36,
                    height: 48,
                    borderRadius: 12,
                    border: '2.5px solid',
                    borderColor: isOtpError ? '#EF4444' : (otp.length === i ? '#7C3AED' : (otp.length > i ? '#7C3AED' : '#E2E8F0')),
                    background: otp.length > i ? '#F5F3FF' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    boxShadow: otp.length === i ? '0 10px 25px rgba(124, 58, 237, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: otp.length === i ? 'translateY(-4px)' : 'none'
                  }}
                >
                  {otp[i] || ''}
                  {otp.length === i && (
                    <div style={{ width: 3, height: 20, background: '#7C3AED', animation: 'blink 1s infinite', borderRadius: 2 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {displayError && (
            <div className="form-error" style={{ justifyContent: 'center', marginTop: 16, color: '#DC2626', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} /> {displayError}
            </div>
          )}
        </div>



        {/* Verify Button */}
        <button
          id="btn-verify-otp"
          className="btn btn-primary btn-lg btn-full"
          onClick={() => handleVerify()}
          disabled={verifying || otp.length < OTP_LENGTH}
          style={{ height: 56, borderRadius: 16, fontSize: '0.95rem', fontWeight: 800, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)' }}
        >
          {verifying ? (
            <><Loader2 size={20} className="spin" /> Verifying...</>
          ) : (
            'Verify & Continue'
          )}
        </button>

        {/* Actions */}
        <div className="otp-actions">
          <button
            id="btn-change-number"
            onClick={() => {
              logout()
              localStorage.removeItem('temp_login_phone')
              navigate('/login')
            }}
            className="btn btn-ghost"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
              fontSize: '0.85rem', fontWeight: 700, color: '#64748B', border: '1px solid #F1F5F9', borderRadius: 12,
            }}
          >
            <ArrowLeft size={16} /> <span>Change Number</span>
          </button>

          {timer > 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>
              Resend in <span style={{ color: '#7C3AED' }}>{timer}s</span>
            </div>
          ) : (
            <button
              id="btn-resend-otp"
              onClick={handleResend}
              disabled={resending}
              className="btn btn-ghost"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                fontSize: '0.85rem', fontWeight: 700, color: '#7C3AED', border: '1px solid #EDE9FE', borderRadius: 12,
              }}
            >
              <RefreshCw size={16} className={resending ? 'spin' : ''} />
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
        
        .otp-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          gap: 10px;
        }

        @media (max-width: 400px) {
          .otp-actions { flex-direction: column-reverse; gap: 12px; }
          .otp-actions > button, .otp-actions > div { width: 100%; justify-content: center; display: flex; }
        }

        @media (max-width: 360px) {
          .otp-card { padding: 24px 12px !important; }
          .otp-input-container { gap: 4px !important; }
          .otp-input-box { width: 32px !important; height: 42px !important; font-size: 1rem !important; }
        }

        @media (max-width: 320px) {
          .otp-input-container { gap: 3px !important; }
          .otp-input-box { width: 30px !important; height: 40px !important; font-size: 0.95rem !important; }
        }
      `}</style>
    </div>
  )
}
