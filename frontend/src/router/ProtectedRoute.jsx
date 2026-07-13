import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

/**
 * ProtectedRoute — wraps any routes that need authentication
 * Props:
 *   requireRole — if set, user must have this role (or 'admin' bypasses)
 */
export default function ProtectedRoute({ requireRole }) {
  const { isAuthenticated, hasRole, user, loading } = useAuth()

  // While hydrating from localStorage, show spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16
      }}>
        <Loader2 size={22} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not logged in → login page
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Logged in but no role selected yet → role select
  const path = window.location.pathname
  if (!hasRole && path !== '/role-select' && path !== '/language-select' && path !== '/referral-setup') {
    return <Navigate to="/role-select" replace />
  }

  // Role-gated route check
  if (requireRole && user?.role !== requireRole && user?.role !== 'admin') {
    // If mismatch, send to their own specific module home
    const dest = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
    return <Navigate to={dest} replace />
  }

  // Role-specific Onboarding Enforcement — only profile registration is mandatory
  if ((user?.role === 'transport' || user?.role === 'garage') && user?.id) {
    const rolePrefix = user.role;
    const currentPath = window.location.pathname;

    // Force Profile Registration if not complete
    if (!user.setupComplete && currentPath !== `/register/${rolePrefix}`) {
      return <Navigate to={`/register/${rolePrefix}`} replace />;
    }
    // NOTE: Subscription is NO longer enforced here.
    // Subscription check happens inside CreateBill when user tries to generate a bill.
  }

  return <Outlet />
}
