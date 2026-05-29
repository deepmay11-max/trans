import { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import BottomNav from '../components/layout/BottomNav'
import TopHeader from '../components/layout/TopHeader'
import MobileHeader from '../components/layout/MobileHeader'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'


export default function MainLayout() {
  const { t } = useTranslation()
  const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useApp()
  const { user } = useAuth()
  const location = useLocation()
  const isTransport = (localStorage.getItem('view_mode') || 'transport') === 'transport'

  // Safety: If somehow a user lands on a path that doesn't match their role
  // (Defense-in-depth in case of manual URL manipulation)
  if (user && user.role) {
    if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
    if (location.pathname.startsWith('/transport') && user.role !== 'transport' && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
    if (location.pathname.startsWith('/garage') && user.role !== 'garage' && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
  }
  

  const pageMeta = {
    '/transport/dashboard': { title: t('dashboard'), subtitle: t('logistics_overview') },
    '/transport/bills': { title: t('bills'), subtitle: t('freight_invoices_sub') },
    '/transport/parties': { title: t('parties'), subtitle: t('transport_clients_sub') },
    '/garage/dashboard': { title: t('dashboard'), subtitle: t('workshop_overview') },
    '/garage/bills': { title: t('bills'), subtitle: t('service_invoices_sub') },
    '/garage/parties': { title: t('parties'), subtitle: t('garage_customers_sub') },
    '/finance': { title: t('finance'), subtitle: t('finance_sub') },
    '/profile': { title: t('profile'), subtitle: t('profile_sub') },
    '/transport/trips': { title: t('trips'), subtitle: t('trips_sub') },
    '/transport/vehicles': { title: t('vehicles'), subtitle: t('fleet_sub') },
    '/garage/vehicles': { title: t('vehicles'), subtitle: t('customer_vehicles_sub') },
    '/garage/services': { title: t('services'), subtitle: t('service_records_sub') },
    '/transport/expenses': { title: t('daily_expense'), subtitle: t('expenses_sub') },
    '/admin/dashboard': { title: t('admin'), subtitle: t('system_overview') },
    '/admin/users': { title: t('user_mgmt'), subtitle: t('user_mgmt_sub') },
    '/admin/billing': { title: t('bills'), subtitle: t('all_system_bills_sub') },
    '/admin/software-sales': { title: null, subtitle: null },
  }

  let meta = pageMeta[location.pathname] || { title: 'TRANS', subtitle: null }

  if (location.pathname === '/admin/software-sales') {
    meta = {
      title: isTransport ? t('transport') + ' ' + t('software_sales') : t('garage') + ' ' + t('software_sales'),
      subtitle: t('manage_deals_sub')
    }
  }

  // Global Navigation: Level 1 pages (Dashboard, main lists) get Hamburger. 
  // Level 2+ pages (Details, Forms) get Back Button.
  const pathParts = location.pathname.split('/').filter(Boolean)

  // Decide if this is a main top-level page
  const isTopLevel = pathParts.length <= 1 ||
    (pathParts.length === 2 && (pathParts[1] === 'dashboard' || pathParts[1] === 'bills' || pathParts[1] === 'parties' || pathParts[1] === 'vehicles' || pathParts[1] === 'services'))

  const showBack = !isTopLevel && location.pathname !== '/dashboard' && !location.pathname.endsWith('/dashboard')

    return (
    <div className={`app-layout ${location.pathname.startsWith('/admin') ? 'admin-layout' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Desktop top header */}
        {!showBack && <TopHeader title={meta.title} subtitle={meta.subtitle} />}

        {/* Mobile sticky header */}
        {!showBack && (
          <MobileHeader
            title={meta.title}
            showBack={false}
            showNotif={true}
          />
        )}


        {/* Page content */}
        <div className={`page-content ${showBack ? 'no-global-header' : ''}`}>
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navbar */}
      {!location.pathname.startsWith('/admin') && <BottomNav />}
    </div>
  )
}
