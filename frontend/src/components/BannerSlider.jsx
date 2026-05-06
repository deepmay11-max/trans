import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield } from 'lucide-react'
import TranslatedText from './TranslatedText'

export default function BannerSlider({ banners, getTranslatedText }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!banners || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [banners])

  if (!banners || banners.length === 0) return null

  const banner = banners[currentIndex]

  return (
    <div style={{ marginBottom: 20, position: 'relative' }}>
      <div 
        onClick={() => {
          if (banner.link.startsWith('/')) navigate(banner.link)
          else window.open(banner.link, '_blank')
        }}
        className="animate-fadeIn"
        style={{ 
          background: '#FFFFFF', borderRadius: 28, padding: '32px 36px', color: '#0F172A',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s',
          minHeight: 180, display: 'flex', alignItems: 'center', border: '1px solid #F1F5F9'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0F172A' }}>
              <TranslatedText>{banner.title}</TranslatedText>
            </h2>
            {banner.badge && (
              <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#F59E0B', color: 'white', padding: '3px 12px', borderRadius: 100, textTransform: 'uppercase' }}>
                <TranslatedText>{banner.badge}</TranslatedText>
              </span>
            )}
          </div>
          <p style={{ fontSize: '1rem', color: '#64748B', margin: 0, maxWidth: '70%', fontWeight: 500, lineHeight: 1.4 }}>
            <TranslatedText>{banner.subtitle}</TranslatedText>
          </p>
          
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 800, color: '#4F46E5' }}>
             {getTranslatedText('Explore Now')} <ArrowRight size={16} />
          </div>
        </div>

        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', zIndex: 1 }}>
          {banner.imageUrl ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img src={banner.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 20 }} alt="Banner" />
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', opacity: 0.05, paddingRight: 40 }}>
              <Shield size={140} style={{ transform: 'rotate(-20deg)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicators */}
      {banners.length > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
          {banners.map((_, idx) => (
            <div 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{ 
                width: idx === currentIndex ? 24 : 8, 
                height: 8, 
                borderRadius: 4, 
                background: idx === currentIndex ? '#7C3AED' : '#CBD5E1',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
