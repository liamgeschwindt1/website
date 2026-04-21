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
        <div className="flex-1 ml-[220px] min-w-0">
          {children}
        </div>
        <GithubWidget />
      </div>
    </CRMProvider>
  )
}
