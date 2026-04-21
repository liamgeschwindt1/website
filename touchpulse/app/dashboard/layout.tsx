import React from 'react'
import { CRMProvider } from '@/context/CRMContext'

export const metadata = {
  title: 'TouchPulse — Internal Dashboard',
  description: 'TouchPulse internal marketing dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CRMProvider>
      {children}
    </CRMProvider>
  )
}
