'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export default function CTABanner() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="contact"
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
          Ready to make your
          <br />
          space{' '}
          <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}>
            truly
          </em>{' '}
          accessible?
        </h2>
        <p className="text-[18px] text-[var(--body)] mb-10">
          Tiera is deployed in days, not months. Let&#39;s talk about what&#39;s possible.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="mailto:info@touchpulse.nl"
            className="inline-flex items-center gap-[6px] px-[22px] py-[10px] min-h-[44px] rounded-[6px] bg-[var(--gold)] text-[#031119] text-[14px] font-medium no-underline hover:opacity-90 transition-opacity duration-150"
          >
            Book a demo ↗
          </Link>
          <Link
            href="mailto:info@touchpulse.nl"
            className="inline-flex items-center px-4 py-2 min-h-[44px] border border-[rgba(255,255,255,0.6)] rounded-[6px] text-[var(--text)] text-[13px] font-medium no-underline hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150"
          >
            Talk to sales →
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
