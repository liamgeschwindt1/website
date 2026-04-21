import type { Metadata } from 'next'
import { inter, lora, jetbrainsMono } from './fonts'
import { AccessibilityProvider } from '@/components/AccessibilityProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Touchpulse — Navigation Intelligence Platform',
  description: 'Touchpulse gives people with sight loss the freedom to move independently. Powered by Tiera AI and 24/7 human support.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://touchpulse.nl'),
  openGraph: {
    title: 'Touchpulse — Navigation Intelligence Platform',
    description: 'AI-powered navigation for people with sight loss.',
    url: 'https://touchpulse.nl',
    siteName: 'Touchpulse',
    locale: 'en_NL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  )
}
