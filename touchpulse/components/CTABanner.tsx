'use client'

import { motion, useReducedMotion } from 'framer-motion'
import siteCopy from '@/content/siteCopy.json'

type CTACopy = typeof siteCopy.ctaBanner

interface CTABannerProps {
  copy?: Partial<CTACopy>
  onSetMessage: (msg: string) => void
}

export default function CTABanner({ copy: copyProp, onSetMessage }: CTABannerProps) {
  const prefersReduced = useReducedMotion()
  const copy = { ...siteCopy.ctaBanner, ...copyProp }

  return (
    <section
      id="cta-banner"
      aria-labelledby="cta-heading"
      className="relative px-[clamp(24px,5vw,80px)] py-[128px] text-center overflow-hidden border-t border-[var(--border)]"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(1,180,175,0.18) 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10"
        {...(prefersReduced
          ? {}
          : {
              initial: { opacity: 0, y: 24 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
            })}
      >
        <h2
          id="cta-heading"
          className="text-[clamp(32px,5vw,56px)] font-medium tracking-[-0.03em] leading-[1.1] mb-4"
        >
          {copy.heading}
        </h2>
        <p className="text-[18px] text-[var(--body)] mb-10">
          {copy.body}
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => {
              onSetMessage(copy.earlyAccessMessage)
              const el = document.getElementById('contact')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center gap-[6px] px-[22px] py-[10px] min-h-[44px] rounded-[6px] bg-[var(--gold)] text-[#031119] text-[14px] font-medium hover:opacity-90 transition-opacity duration-150"
          >
            {copy.primaryButton}
          </button>
          <button
            type="button"
            onClick={() => {
              onSetMessage(copy.waitlistMessage)
              const el = document.getElementById('contact')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center px-4 py-2 min-h-[44px] border border-[rgba(255,255,255,0.6)] rounded-[6px] text-[var(--text)] text-[13px] font-medium hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150"
          >
            {copy.secondaryButton}
          </button>
        </div>

        {/* O&M Studio strip */}
        <motion.div
          className="mt-16 border-t border-[var(--border)] pt-10"
          {...(prefersReduced
            ? {}
            : {
                initial: { opacity: 0, y: 16 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 },
              })}
        >
          <p className="text-[13px] text-[var(--muted)] mb-4 tracking-wide uppercase">{copy.poweredByLabel}</p>
          <a
            href="https://studio.touchpulse.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-[10px] border border-[rgba(1,180,175,0.30)] bg-[rgba(1,180,175,0.05)] no-underline hover:border-[rgba(1,180,175,0.65)] hover:bg-[rgba(1,180,175,0.10)] transition-all duration-300"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse-glow" aria-hidden="true" />
            <span className="text-[15px] font-medium text-[var(--text)] tracking-[-0.01em]">
              O&amp;M Studio
            </span>
            <span className="text-[13px] text-[var(--muted)] group-hover:text-[var(--teal)] transition-colors duration-200">
              studio.touchpulse.ai ↗
            </span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
