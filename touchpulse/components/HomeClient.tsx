'use client'

import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'

const PHOTO = (slug: string) => `/images/photos/${slug}.jpg`

export default function HomeClient() {
  return (
    <>
      <Nav />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section
          aria-label="Hero"
          className="relative min-h-screen flex items-center px-[clamp(24px,5vw,80px)] pt-[120px] pb-[80px] overflow-hidden"
        >
          <div className="hero-aurora" aria-hidden="true">
            <div className="hero-aurora-blob" />
            <div className="hero-aurora-blob" />
            <div className="hero-aurora-blob" />
          </div>
          <div className="grain" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-[60px] items-center w-full max-w-[1280px] mx-auto">
            <div>
              <p className="brand-eyebrow mb-5" style={{ color: 'var(--teal)' }}>
                <span style={{ color: 'var(--teal)' }}>✦</span> AI-powered navigation
              </p>
              <h1 className="text-[clamp(40px,5.5vw,70px)] font-medium leading-[1.06] tracking-[-0.03em] mb-6 text-[var(--text)]">
                Every person. Every journey.{' '}
                <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400, color: 'var(--teal)' }}>
                  Real confidence.
                </em>
              </h1>
              <p className="text-[18px] text-[var(--body)] max-w-[520px] mb-9 leading-[1.7]">
                Tiera turns any street or building into a clear step-by-step guide — powered by AI and real human navigators.
              </p>
              <div className="flex items-center gap-[14px] flex-wrap">
                <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="btn-pill-gold">
                  Download Tiera free
                </a>
                <a href="#how-tiera-works" className="btn-ghost">See how it works →</a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px] aspect-[4/5] rounded-[20px] overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <Image
                  src={PHOTO('man-walking-berlin-side-view')}
                  alt="A man walks confidently through a city street using Tiera"
                  fill priority sizes="(max-width: 1024px) 80vw, 480px"
                  style={{ objectFit: 'cover' }}
                />
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(3,17,25,0.55) 100%)' }} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" aria-hidden="true"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
        </section>

        {/* ── Proof bar ─────────────────────────────────────────────── */}
        <section
          aria-label="Trust signals"
          className="px-[clamp(24px,5vw,80px)] py-10 border-t border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: '#040d15' }}
        >
          <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
            <p className="brand-eyebrow" style={{ color: 'var(--muted)' }}>Built with people who navigate every day</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]" style={{ color: 'var(--muted)' }}>
              <span>● Live human support</span>
              <span>● iOS · TestFlight</span>
              <span>● WCAG 2.1 AA</span>
              <span>● Built in Amsterdam</span>
            </div>
          </div>
        </section>

        {/* ── What Tiera does ───────────────────────────────────────── */}
        <section
          id="how-tiera-works"
          aria-labelledby="what-tiera-heading"
          style={{ backgroundColor: '#F7F7F7' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px]"
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="brand-eyebrow mb-3" style={{ color: '#6B7280' }}>
              <span style={{ color: '#01B4AF' }}>✦</span> What Tiera does
            </p>
            <h2 id="what-tiera-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] mb-12 max-w-[640px]" style={{ color: '#111827' }}>
              Three things, done well.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
              {[
                { img: 'man-preparing-route', alt: 'Person setting up a route on their phone', title: 'Turn-by-turn audio.', body: 'Speak your destination or type it. Tiera guides you step by step with your screen off.' },
                { img: 'teleoperator', alt: 'A live navigator at her workstation', title: 'A real person on call.', body: 'Tap once to connect to a live human navigator who can guide you, read signs, and help with everyday tasks.' },
                { img: 'man-walking-through-uni-halls', alt: 'A man walks through a university hall', title: 'Stay oriented.', body: 'Hold your phone out and Tiera uses haptic feedback to indicate when you face the right direction.' },
              ].map(({ img, alt, title, body }, i) => (
                <Reveal key={img} delay={i * 80}>
                  <article className="flex flex-col gap-4">
                    <div className="relative aspect-[4/3] rounded-[12px] overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                      <Image src={PHOTO(img)} alt={alt} fill sizes="(max-width: 768px) 100vw, 400px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ borderLeft: '4px solid #01B4AF', paddingLeft: 16 }}>
                      <h3 className="text-[18px] font-medium mb-2" style={{ color: '#111827' }}>{title}</h3>
                      <p className="text-[15px] leading-[1.7]" style={{ color: '#374151' }}>{body}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section
          aria-labelledby="how-it-works-heading"
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-t"
          style={{ backgroundColor: '#031119', borderColor: 'var(--border)' }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="brand-eyebrow mb-3" style={{ color: 'var(--teal)' }}>✦ How it works</p>
            <h2 id="how-it-works-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-12 max-w-[600px]">
              Up and running in minutes.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: '1', title: 'Download.', text: 'Install Tiera on iPhone. Set up takes under two minutes.' },
                { n: '2', title: 'Speak it.', text: 'Tap the destination button and say or type where you want to go.' },
                { n: '3', title: 'Go.',       text: 'Follow audio turn-by-turn — or tap to bring a live human navigator on the line.' },
              ].map(({ n, title, text }, i) => (
                <Reveal key={n} delay={i * 80}>
                  <div style={{ borderLeft: '4px solid var(--teal)', paddingLeft: 20 }}>
                    <div className="brand-eyebrow mb-3" style={{ color: 'var(--teal)' }}>Step {n}</div>
                    <h3 className="text-[18px] font-medium mb-2 text-[var(--text)]">{title}</h3>
                    <p className="text-[15px] text-[var(--body)] leading-[1.7]">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Teleassistance ────────────────────────────────────────── */}
        <section
          aria-labelledby="teleassistance-heading"
          style={{ backgroundColor: '#F7F7F7' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center max-w-[1200px] mx-auto">
            <Reveal>
              <div className="relative aspect-[4/3] rounded-[12px] overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <Image
                  src={PHOTO('user-at-door')}
                  alt="A user finds the entrance of a building with help from a Tiera navigator"
                  fill sizes="(max-width: 1024px) 90vw, 600px" style={{ objectFit: 'cover' }}
                />
              </div>
            </Reveal>
            <div>
              <p className="brand-eyebrow mb-3" style={{ color: '#6B7280' }}>
                <span style={{ color: '#01B4AF' }}>●</span> Live support
              </p>
              <h2 id="teleassistance-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-6" style={{ color: '#111827' }}>
                A real person, when you need one.
              </h2>
              <p className="text-[17px] leading-[1.75] mb-8 max-w-[520px]" style={{ color: '#374151' }}>
                Live agents guide you through complex spaces, read signs, identify objects, and help with everyday tasks like reading medication labels or matching clothing — for as long as you need them.
              </p>
              <Link href="/tiera" className="btn-ghost btn-ghost-teal">Learn more about Tiera →</Link>
            </div>
          </div>
        </section>

        {/* ── O&M Studio teaser ─────────────────────────────────────── */}
        <section
          aria-labelledby="om-teaser-heading"
          className="relative px-[clamp(24px,5vw,80px)] py-[96px] overflow-hidden"
          style={{ backgroundColor: '#060c12' }}
        >
          <div className="ai-aurora" aria-hidden="true" />
          <div className="grain" aria-hidden="true" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center max-w-[1200px] mx-auto">
            <div>
              <p className="brand-eyebrow mb-3" style={{ color: 'var(--teal)' }}>✦ For O&amp;M professionals</p>
              <h2 id="om-teaser-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-5">
                Your expertise, everywhere your students go.
              </h2>
              <p className="text-[17px] text-[var(--body)] leading-[1.75] mb-6 max-w-[520px]">
                Record routes in the field. Attach professional cues to precise GPS locations. Deliver your guidance through Tiera — even when you are not there.
              </p>
              <span className="badge-teal mb-8">Coming soon — join the waitlist</span>
              <div className="mt-6">
                <Link href="/om-studio" className="btn-ghost">Explore O&amp;M Studio →</Link>
              </div>
            </div>
            <Reveal>
              <div className="relative aspect-[4/3] rounded-[12px] overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <Image
                  src={PHOTO('blind-man-studying-braille')}
                  alt="A trainer working with a student on orientation skills"
                  fill sizes="(max-width: 1024px) 90vw, 560px" style={{ objectFit: 'cover' }}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Use cases ─────────────────────────────────────────────── */}
        <section
          aria-label="Use cases"
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-t"
          style={{ backgroundColor: '#031119', borderColor: 'var(--border)' }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="brand-eyebrow mb-3" style={{ color: 'var(--teal)' }}>✦ Built for real days</p>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-12 max-w-[640px]">
              Wherever the day takes you.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { img: 'pov-train-station', title: 'Stations.', body: 'From the platform to the exit, with confidence.' },
                { img: 'pov-supermarket',   title: 'Supermarkets.', body: 'Find aisles, ask a navigator to read a label.' },
                { img: 'pov-street-crossing', title: 'Crossings.', body: 'Know exactly when to step off the kerb.' },
                { img: 'pov-terminal-airport', title: 'Airports.', body: 'Gates, transfers, lounges — guided end to end.' },
              ].map(({ img, title, body }, i) => (
                <Reveal key={img} delay={i * 60}>
                  <article className="brand-card flex flex-col gap-4 h-full">
                    <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden">
                      <Image src={PHOTO(img)} alt={title} fill sizes="(max-width: 768px) 100vw, 280px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-medium mb-1 text-[var(--text)]">{title}</h3>
                      <p className="text-[14px] text-[var(--body)] leading-[1.65]">{body}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── What's coming ─────────────────────────────────────────── */}
        <section
          aria-labelledby="whats-coming-heading"
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-t"
          style={{ backgroundColor: '#040d15', borderColor: 'var(--border)' }}
        >
          <div className="max-w-[1200px] mx-auto">
            <p className="brand-eyebrow mb-3" style={{ color: 'var(--teal)' }}>✦ Roadmap</p>
            <h2 id="whats-coming-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-12">
              What&apos;s coming.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
              <Reveal>
                <article className="brand-card h-full">
                  <h3 className="text-[20px] font-medium text-[var(--text)] mb-3">O&amp;M Studio</h3>
                  <p className="text-[15px] text-[var(--body)] leading-[1.75] mb-6">
                    A professional tool for Orientation and Mobility instructors to record routes in the field and attach expert cues to precise GPS locations.
                  </p>
                  <Link href="/om-studio" className="btn-ghost">Explore →</Link>
                </article>
              </Reveal>
              <Reveal delay={80}>
                <article className="brand-card h-full">
                  <h3 className="text-[20px] font-medium text-[var(--text)] mb-3">Partner integrations</h3>
                  <p className="text-[15px] text-[var(--body)] leading-[1.75] mb-6">
                    Tools for organisations — universities, transit authorities, hospitals — to deploy Tiera for their users and staff.
                  </p>
                  <Link href="/partners" className="btn-ghost">Partner with us →</Link>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <section
          aria-label="Download CTA"
          className="relative px-[clamp(24px,5vw,80px)] py-[96px] text-center overflow-hidden"
        >
          <div className="hero-aurora" aria-hidden="true">
            <div className="hero-aurora-blob" />
            <div className="hero-aurora-blob" />
            <div className="hero-aurora-blob" />
          </div>
          <div className="grain" aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="text-[clamp(28px,4vw,52px)] font-medium tracking-[-0.03em] text-[var(--text)] mb-8 max-w-[720px] mx-auto">
              Start navigating with{' '}
              <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400, color: 'var(--teal)' }}>
                confidence.
              </em>
            </h2>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-gold"
              style={{ padding: '14px 26px', fontSize: 15 }}
            >
              Download Tiera free
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
