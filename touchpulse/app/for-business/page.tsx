import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import UseCases from '@/components/UseCases'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'For Business — TouchPulse',
  description: 'Deploy Tiera navigation intelligence in your venue. Trusted by hospitals, retail environments, and public spaces across the Netherlands.',
}

export default function ForBusinessPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        <div className="px-[clamp(24px,5vw,80px)] py-[72px] border-b border-[var(--border)]">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">For organisations</p>
          <h1 className="text-[clamp(36px,5vw,64px)] font-medium tracking-[-0.03em] leading-[1.1] max-w-[700px]">
            Make your space accessible for every visitor.
          </h1>
          <p className="text-[18px] text-[var(--body)] leading-[1.7] max-w-[580px] mt-6">
            Tiera integrates with your existing environment to provide seamless navigation guidance for blind and low-vision visitors — no physical modifications required.
          </p>
        </div>
        <UseCases />
        <Pricing />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
