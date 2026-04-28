'use client'

import Sidebar from '@/components/Sidebar'
import ErrorBoundary from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { applyTheme } from '@/lib/themes'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    fetch('/api/settings/themes')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.themeId) applyTheme(data.themeId) })
      .catch(() => {})
  }, [])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-w, 220px)', transition: 'margin-left 0.2s' }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  )
}
