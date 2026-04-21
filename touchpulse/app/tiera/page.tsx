import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import AISection from '@/components/AISection'
import Footer from '@/components/Footer'
import Features from '@/components/Features'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tiera — AI Navigation by TouchPulse',
  description: 'Real-time outdoor navigation powered by Tiera AI. Voice guidance, obstacle detection, and 24/7 human backup for people with sight loss.',
}

export default function TieraPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        <div className="px-[clamp(24px,5vw,80px)] py-[72px] border-b border-[var(--border)]">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">The product</p>
          <h1 className="text-[clamp(36px,5vw,64px)] font-medium tracking-[-0.03em] leading-[1.1] max-w-[700px]">
            Tiera — navigation intelligence for a more accessible world.
          </h1>
        </div>
        <Features />
        <AISection />
      </main>
      <Footer />
    </>
  )
}
