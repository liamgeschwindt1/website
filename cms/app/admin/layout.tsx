'use client'

import Sidebar from '@/components/Sidebar'
import GithubWidget from '@/components/GithubWidget'
import { usePathname } from 'next/navigation'
import { CRMProvider } from '@/context/CRMContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <CRMProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-w, 220px)', transition: 'margin-left 0.2s' }}>
          {children}
        </div>
        <GithubWidget />
      </div>
    </CRMProvider>
  )
}
