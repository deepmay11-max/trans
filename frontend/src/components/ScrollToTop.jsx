import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll window (global fallback)
    window.scrollTo(0, 0)
    
    // Scroll MainLayout content area
    const pageContent = document.querySelector('.page-content')
    if (pageContent) {
      pageContent.scrollTo(0, 0)
    }

    // Scroll AuthLayout right panel
    const authRight = document.querySelector('.auth-right')
    if (authRight) {
      authRight.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
