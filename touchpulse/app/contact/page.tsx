import type { Metadata } from 'next'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ClientForm from '@/components/ClientForm'

export const metadata: Metadata = {
  title: 'Contact — Enquire about the Touchpulse platform | Touchpulse',
  description:
    'Get in touch with the Touchpulse team. We will be in touch within one business day to arrange a demo of ROVI, Pathway, and Tiera for your organisation.',
}

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">

        {/* Hero */}
        <section
          aria-labelledby="contact-hero-heading"
          className="px-[clamp(24px,5vw,80px)] py-[80px] border-b border-[var(--border)]"
        >
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-[60px] items-center">
            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--teal)' }}>
                ✦ For O&amp;M organisations
              </p>
              <h1
                id="contact-hero-heading"
                className="text-[clamp(36px,5vw,64px)] font-medium tracking-[-0.03em] leading-[1.07] mb-6 text-[var(--text)]"
              >
                Let&apos;s talk about your service.
              </h1>
              <p className="text-[18px] text-[var(--body)] max-w-[520px] mb-6 leading-[1.7]">
                Whether you run a sight-loss charity, a local authority rehab service, or a private O&amp;M practice, we&apos;ll show you exactly how Touchpulse fits your workflow.
              </p>
              <ul className="flex flex-col gap-3 mb-8 text-[15px] text-[var(--body)]">
                {[
                  '30-minute demo tailored to your organisation',
                  'Live walkthrough of route creation, monitoring, and teleassistance',
                  'No sales pressure — just the platform and your questions',
                  'Response within one business day',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 2 }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://calendly.com/liam-touchpulse"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill-gold"
              >
                Book a demo directly ↗
              </a>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[460px] aspect-[3/4] rounded-[20px] overflow-hidden border"
                style={{ borderColor: 'rgba(255,255,255,0.10)' }}
              >
                <Image
                  src="/images/photos/woman-side-view-trainstation.jpg"
                  alt="A person navigating confidently through a train station"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 460px"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 55%, rgba(3,17,25,0.6) 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Enquiry form */}
        <ClientForm />

      </main>
      <Footer />
    </>
  )
}
