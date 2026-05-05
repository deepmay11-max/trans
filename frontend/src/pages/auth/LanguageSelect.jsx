import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../context/AuthContext'

const languageOptions = [
  { id: 'en', label: 'English', native: 'English', icon: '🇺🇸' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी', icon: '🇮🇳' },
  { id: 'gu', label: 'Gujarati', native: 'ગુજરાતી', icon: '🇮🇳' },
  { id: 'mr', label: 'Marathi', native: 'मराठी', icon: '🇮🇳' },
  { id: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', icon: '🇮🇳' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்', icon: '🇮🇳' },
  { id: 'te', label: 'Telugu', native: 'తెలుగు', icon: '🇮🇳' },
  { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', icon: '🇮🇳' },
  { id: 'ml', label: 'Malayalam', native: 'മലയാളം', icon: '🇮🇳' },
  { id: 'bn', label: 'Bengali', native: 'বাংলা', icon: '🇮🇳' },
]

export default function LanguageSelect() {
  const { language, changeLanguage, isChangingLanguage } = useLanguage()
  const [selected, setSelected] = useState(language)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  // Sync with context if it changes externally
  useEffect(() => {
    setSelected(language)
  }, [language])

  const handleCardClick = (id) => {
    console.log("Card clicked:", id)
    setSelected(id)
  }

  const handleContinue = async () => {
    console.log("Continue clicked. Selected:", selected)
    if (loading || isChangingLanguage) return
    
    setLoading(true)
    try {
      await changeLanguage(selected)
      console.log("Language changed to:", selected)
      
      // Smooth transition delay
      await new Promise(r => setTimeout(r, 600))
      
      if (isAuthenticated) {
        if (!user?.role) {
          navigate('/role-select', { replace: true })
        } else if (!user?.setupComplete) {
          navigate(`/register/${user.role}`, { replace: true })
        } else {
          navigate('/transport/dashboard', { replace: true })
        }
      } else {
        navigate('/login', { replace: true })
      }
    } catch (error) {
      console.error("Language change failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', background: 'transparent' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ 
          width: 72, height: 72, borderRadius: 24, background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          boxShadow: '0 12px 40px rgba(124, 58, 237, 0.25)',
          color: 'white'
        }}>
          <Globe size={32} strokeWidth={2} />
        </div>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: 12 }}>
          Choose Language
        </h2>
        <p style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>
          Please select your preferred language.<br />
          अपनी पसंदीदा भाषा चुनें।
        </p>
      </div>

      {/* Language Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 16,
        marginBottom: 32
      }}>
        {languageOptions.map((lang) => {
          const isActive = selected === lang.id
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => handleCardClick(lang.id)}
              style={{
                padding: '20px 16px',
                borderRadius: '24px',
                background: isActive ? '#F5F3FF' : 'white',
                border: '2.5px solid',
                borderColor: isActive ? '#7C3AED' : '#F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 10px 25px rgba(124, 58, 237, 0.1)' : '0 4px 12px rgba(0,0,0,0.02)',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div style={{ fontSize: '1.75rem' }}>{lang.icon}</div>
              <div>
                <div style={{ fontSize: '1.0625rem', fontWeight: 900, color: '#1E293B' }}>{lang.native}</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{lang.label}</div>
              </div>

              {isActive && (
                <div style={{ position: 'absolute', top: 12, right: 12, color: '#7C3AED' }}>
                  <CheckCircle2 size={20} fill="#7C3AED" color="white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Continue Button */}
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading || isChangingLanguage}
          style={{ 
            width: '100%', height: 60, borderRadius: 20, 
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color: 'white', fontSize: '1.125rem', fontWeight: 800, border: 'none',
            cursor: (loading || isChangingLanguage) ? 'not-allowed' : 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)', transition: 'all 0.2s',
            opacity: (loading || isChangingLanguage) ? 0.7 : 1
          }}
        >
          {loading ? (
            <><Loader2 size={24} className="spin" /> Processing...</>
          ) : (
            <>Continue / जारी रखें <ArrowRight size={24} /></>
          )}
        </button>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        button:active { transform: scale(0.96) !important; }
      `}</style>
    </div>
  )
}
