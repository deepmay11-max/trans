import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield } from 'lucide-react'
import TranslatedText from './TranslatedText'

export default function BannerSlider({ banners, getTranslatedText }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!banners || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [banners])

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
    }
  }

  if (!banners || banners.length === 0) return null

  const banner = banners[currentIndex]

  return (
    <div style={{ marginBottom: 20, position: 'relative' }}>
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleTouchEnd}
        className="animate-fadeIn"
        style={{ 
          background: '#FFFFFF', borderRadius: 28, padding: '32px 36px', color: '#0F172A',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s',
          minHeight: 180, display: 'flex', alignItems: 'center', border: '1px solid #F1F5F9'
        }}
      >
        {/* Full Background Image */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 0 }}>
          {banner.imageUrl ? (
            <img src={banner.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} alt="Banner" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #4F46E5, #7C3AED)' }} />
          )}
        </div>

        {/* Dark Overlay for Text Visibility */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)', zIndex: 1 }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, flex: 1, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              <TranslatedText>{banner.title}</TranslatedText>
            </h2>
            {banner.badge && (
              <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#F59E0B', color: 'white', padding: '3px 12px', borderRadius: 100, textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <TranslatedText>{banner.badge}</TranslatedText>
              </span>
            )}
          </div>
          <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, maxWidth: '85%', fontWeight: 500, lineHeight: 1.4, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            <TranslatedText>{banner.subtitle}</TranslatedText>
          </p>

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
