'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface GetInvolvedProps {
  onSetMessage: (msg: string) => void
}

const earlyAccessMsg = "I'd like early access to the Tiera development app."
const waitlistMsg = "I'd like to join the waitlist for the December Tiera launch."

function scrollToContact() {
  const el = document.getElementById('contact')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const capabilities = [
  { label: 'Voice destination input', ready: true },
  { label: 'Turn-by-turn audio navigation', ready: true },
  { label: '"Where am I?" surroundings awareness', ready: true },
  { label: 'Off-route detection and rerouting', ready: true },
  { label: 'Saved places and navigation history', ready: true },
  { label: 'Bluetooth headset &amp; hands-free mode', ready: true },
  { label: 'Organisation membership codes', ready: true },
  { label: 'Human teleassistance (live operators)', ready: true },
  { label: 'Accessible high-contrast map view', ready: true },
  { label: 'Multi-language support', ready: true },
  { label: 'Custom instruction preferences', ready: true },
  { label: 'Route overview and ETA', ready: true },
  { label: 'O&amp;M Studio for certified instructors', ready: false },
  { label: 'Full companion AI (context-aware)', ready: false },
  { label: 'Offline support and positioning', ready: false },
  { label: 'Verified instructor routes', ready: false },
]

export default function GetInvolved({ onSetMessage }: GetInvolvedProps) {
  const prefersReduced = useReducedMotion()
  const mp = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      }

  function handleEarlyAccess() {
    onSetMessage(earlyAccessMsg)
    scrollToContact()
  }

  function handleWaitlist() {
    onSetMessage(waitlistMsg)
    scrollToContact()
  }

  return (
    <section
      id="get-involved"
      aria-labelledby="get-involved-heading"
      className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div {...mp}>
        {/* Intro block */}
        <div className="max-w-[600px] mx-auto text-center mb-14">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Where we are now
          </p>
          <h2
            id="get-involved-heading"
            className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-5"
          >
            Tiera is real. It&apos;s early. And we want you involved.
          </h2>
          <p className="text-[17px] text-[var(--body)] leading-[1.7]">
            We won&apos;t pretend it&apos;s finished. The app works — navigation, voice guidance, human backup, and more are live today. But there are rough edges, missing features, and plenty left to build. That&apos;s exactly why we need you. Real users, real feedback, real impact on what comes next.
          </p>
        </div>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Left card — Early access */}
          <article
            className="rounded-[12px] p-8 bg-[var(--surface)] border border-[var(--teal)] flex flex-col"
            aria-labelledby="early-access-heading"
          >
            <div className="mb-5">
              <span className="inline-flex items-center gap-[6px] px-[12px] py-[4px] rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.45)] text-[var(--gold)] text-[11px] font-medium">
                ⚡ Early access
              </span>
            </div>
            <h3 id="early-access-heading" className="text-[22px] font-medium text-[var(--text)] mb-1 tracking-[-0.01em]">
              Try Tiera now.
            </h3>
            <p className="text-[15px] text-[var(--muted)] mb-4">
              For the curious and the brave.
            </p>
            <p className="text-[14px] text-[var(--body)] leading-[1.6] mb-6">
              The app is in active development. You&apos;ll get access to what works today — voice navigation, AI guidance, human backup, and route planning. You&apos;ll also hit the parts we&apos;re still building. Your feedback directly shapes what we fix next.
            </p>
            <ul className="flex flex-col gap-[10px] mb-6" aria-label="What you get with early access">
              {[
                'Access to the current Tiera app (iOS & Android)',
                'Direct line to the founding team',
                'Your feedback acted on, fast',
                'Early adopter status for the December launch',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px] text-[var(--body)] leading-[1.5]">
                  <span className="text-[var(--teal)] text-[12px] mt-[2px] flex-shrink-0" aria-hidden="true">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic', marginTop: '16px' }}>
              This is a development build. Expect occasional bugs, incomplete features, and frequent updates. Not recommended as a sole navigation tool yet.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleEarlyAccess}
                className="inline-flex items-center gap-[6px] px-[22px] py-[10px] min-h-[44px] rounded-[6px] bg-[var(--gold)] text-[#031119] text-[14px] font-medium hover:opacity-90 transition-opacity duration-150"
              >
                Get early access ↗
              </button>
            </div>
          </article>

          {/* Right card — Waitlist */}
          <article
            className="rounded-[12px] p-8 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] flex flex-col transition-colors duration-200"
            aria-labelledby="waitlist-heading"
          >
            <div className="mb-5">
              <span className="inline-flex items-center gap-[6px] px-[12px] py-[4px] rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.14)] text-[var(--muted)] text-[11px] font-medium">
                December 2025
              </span>
            </div>
            <h3 id="waitlist-heading" className="text-[22px] font-medium text-[var(--text)] mb-1 tracking-[-0.01em]">
              Wait for the full launch.
            </h3>
            <p className="text-[15px] text-[var(--muted)] mb-4">
              Tiera. Finished, polished, and ready.
            </p>
            <p className="text-[14px] text-[var(--body)] leading-[1.6] mb-6">
              In December we launch the complete Tiera experience — everything the vision promises. Companion navigation, O&amp;M instructor routes, human teleassistance, and a product built around real feedback from real users.
            </p>
            <ul className="flex flex-col gap-[10px] flex-1" aria-label="What's coming in the full launch">
              {[
                'Full companion AI — context-aware, relationship-driven',
                'O&M Studio for certified instructors',
                'Verified routes from professional instructors',
                'Full teleassistance platform',
                'Offline support and VPS positioning',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px] text-[var(--body)] leading-[1.5]">
                  <span className="text-[var(--teal)] text-[12px] mt-[2px] flex-shrink-0" aria-hidden="true">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleWaitlist}
                className="inline-flex items-center px-4 py-2 min-h-[44px] border border-[rgba(255,255,255,0.6)] rounded-[6px] text-[var(--text)] text-[13px] font-medium hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150"
              >
                Join the waitlist →
              </button>
            </div>
          </article>
        </div>

        {/* What works today */}
        <div>
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Current capabilities
          </p>
          <h3 className="text-[clamp(22px,2.8vw,36px)] font-medium tracking-[-0.02em] leading-[1.15] mb-10">
            Here&apos;s what Tiera can do right now.
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] rounded-[12px] overflow-hidden mb-6">
            {capabilities.map((cap) => (
              <div
                key={cap.label}
                className="bg-[var(--surface)] px-5 py-4 flex items-start gap-3"
              >
                <span
                  className="mt-[2px] flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px]"
                  style={{
                    background: cap.ready ? 'rgba(1,180,175,0.15)' : 'rgba(255,255,255,0.06)',
                    border: cap.ready ? '1px solid rgba(1,180,175,0.40)' : '1px solid rgba(255,255,255,0.12)',
                    color: cap.ready ? 'var(--teal)' : 'var(--muted)',
                  }}
                  aria-hidden="true"
                >
                  {cap.ready ? '✓' : '·'}
                </span>
                <span
                  className="text-[13px] leading-[1.5]"
                  style={{ color: cap.ready ? 'var(--text)' : 'var(--muted)' }}
                  dangerouslySetInnerHTML={{ __html: cap.label }}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>
            ✓ Live today &nbsp;·&nbsp; · Coming in December 2025 &nbsp;·&nbsp; More added every week.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
