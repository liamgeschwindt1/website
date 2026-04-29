'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function HomeClient() {
  return (
    <>
      <Nav />
      <main>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section
          aria-label="Hero"
          style={{ backgroundColor: '#031119' }}
          className="min-h-screen flex items-center px-[clamp(24px,5vw,80px)] pt-[100px] pb-[80px]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-[60px] items-center w-full max-w-[1280px] mx-auto">
            {/* Left */}
            <div>
              <p
                className="text-[clamp(20px,2.5vw,28px)] mb-4 leading-none"
                style={{
                  fontFamily: 'var(--font-lora)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: 'var(--teal)',
                }}
              >
                Tiera.
              </p>
              <h1 className="text-[clamp(40px,5.5vw,68px)] font-medium leading-[1.07] tracking-[-0.03em] mb-6 text-[var(--text)]">
                Navigation that works<br />for everyone.
              </h1>
              <p className="text-[17px] text-[var(--body)] max-w-[500px] mb-9 leading-[1.7]">
                Tiera gives people with visual impairments clear, step-by-step guidance — supported by AI and real human navigators.
              </p>
              <div className="flex items-center gap-[14px] flex-wrap">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[6px] px-[22px] py-[10px] rounded-full bg-[var(--gold)] text-[#031119] text-[14px] font-semibold no-underline hover:opacity-90 transition-opacity duration-150 min-h-[44px]"
                >
                  Download Tiera free
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center px-4 py-2 min-h-[44px] border border-[var(--teal)] rounded-[6px] text-[var(--teal)] text-[14px] font-medium no-underline hover:bg-[rgba(1,180,175,0.08)] transition-colors duration-150"
                >
                  Learn how it works →
                </a>
              </div>
            </div>

            {/* Right — product screenshot placeholder */}
            <div className="flex justify-center lg:justify-end">
              <div
                aria-hidden="true"
                style={{
                  width: 'clamp(200px,28vw,340px)',
                  aspectRatio: '9/19',
                  borderRadius: '2.8rem',
                  border: '6px solid rgba(255,255,255,0.12)',
                  background: 'linear-gradient(160deg, #071d2e 0%, #031119 100%)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-lora)',
                    fontStyle: 'italic',
                    color: 'var(--teal)',
                    fontSize: '1.5rem',
                    opacity: 0.5,
                  }}
                >
                  Tiera
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── What Tiera Is ──────────────────────────────────────── */}
        <section
          id="how-it-works"
          aria-labelledby="what-tiera-is-heading"
          style={{ backgroundColor: '#f5f7f5' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px]"
        >
          <div className="max-w-[760px]">
            <h2
              id="what-tiera-is-heading"
              className="text-[11px] font-medium tracking-[0.08em] uppercase mb-12"
              style={{ color: '#4a6a5a' }}
            >
              What Tiera does
            </h2>
            <div className="flex flex-col gap-10">
              {[
                {
                  text: 'Turn-by-turn audio navigation. Speak your destination or type it — Tiera guides you step by step with your screen off.',
                },
                {
                  text: 'Live human support. Connect to a real navigator in seconds. They can guide you through complex spaces, read printed text, and help with everyday tasks.',
                },
                {
                  text: 'Orientation tools. At any point ask Tiera to help you face the right direction using haptic feedback and your camera.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: '4px solid #01B4AF',
                    paddingLeft: '28px',
                  }}
                >
                  <p
                    className="text-[clamp(16px,1.6vw,20px)] leading-[1.65]"
                    style={{ color: '#1a2e22' }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What's Coming ──────────────────────────────────────── */}
        <section
          aria-labelledby="whats-coming-heading"
          style={{ backgroundColor: '#031119' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
        >
          <h2
            id="whats-coming-heading"
            className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-12"
          >
            What&apos;s coming.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px]">
            {/* O&M Studio block */}
            <div>
              <h3 className="text-[20px] font-medium text-[var(--text)] mb-4">O&amp;M Studio</h3>
              <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-6">
                A professional tool for Orientation and Mobility instructors to record routes in the field, attach expert cues to precise GPS locations, and deliver verified guidance through Tiera. Built for instructors, by people who understand the craft.
              </p>
              <a
                href="https://studio.touchpulse.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 border border-[rgba(255,255,255,0.4)] rounded-[6px] text-[14px] font-medium text-[var(--text)] no-underline hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150 min-h-[44px]"
              >
                Go to O&amp;M Studio ↗
              </a>
            </div>

            {/* Partner integrations block */}
            <div>
              <h3 className="text-[20px] font-medium text-[var(--text)] mb-4">Partner integrations</h3>
              <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-6">
                We are building tools for organisations — universities, transit authorities, hospitals — to deploy Tiera for their users and staff. If you represent an organisation, we want to hear from you.
              </p>
              <Link
                href="/partners"
                className="inline-flex items-center px-5 py-2.5 border border-[rgba(255,255,255,0.4)] rounded-[6px] text-[14px] font-medium text-[var(--text)] no-underline hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150 min-h-[44px]"
              >
                Partner with us →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
