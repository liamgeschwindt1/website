'use client'

import { SessionProvider } from 'next-auth/react'
import { CampaignProvider } from '@/context/CampaignContext'
import { ToastProvider } from '@/components/Toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CampaignProvider>
          {children}
        </CampaignProvider>
      </ToastProvider>
    </SessionProvider>
  )
}
