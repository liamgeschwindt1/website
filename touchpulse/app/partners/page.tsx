import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import HumanRow from '@/components/HumanRow'
import CTABanner from '@/components/CTABanner'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Partners — TouchPulse',
  description: 'We build with people who have lived experience of sight loss. Meet the partners who shape Tiera.',
}

export default function PartnersPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        <div className="px-[clamp(24px,5vw,80px)] py-[72px] border-b border-[var(--border)]">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">Partners &amp; advisors</p>
          <h1 className="text-[clamp(36px,5vw,64px)] font-medium tracking-[-0.03em] leading-[1.1] max-w-[700px]">
            Built with people who know what it means to navigate the world differently.
          </h1>
          <p className="text-[18px] text-[var(--body)] leading-[1.7] max-w-[580px] mt-6">
            Tiera is shaped by partnerships with blind and low-vision communities, advocacy organisations, and technology leaders with lived experience.
          </p>
        </div>
        <HumanRow />
        <CTABanner onSetMessage={() => {}} />
      </main>
      <Footer />
    </>
  )
}
