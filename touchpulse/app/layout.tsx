import type { Metadata } from 'next'
import { inter, lora, jetbrainsMono } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'TouchPulse — Navigation Intelligence Platform',
  description: 'TouchPulse gives people with sight loss the freedom to move independently through any building or street. Powered by Tiera AI and 24/7 human support.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://touchpulse.nl'),
  openGraph: {
    title: 'TouchPulse — Navigation Intelligence Platform',
    description: 'AI-powered navigation for people with sight loss. 2.4M routes completed.',
    url: 'https://touchpulse.nl',
    siteName: 'TouchPulse',
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
      <body>{children}</body>
    </html>
  )
}
