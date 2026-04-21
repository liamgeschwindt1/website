'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

export default function AISection() {
  const prefersReduced = useReducedMotion()
  const mp = prefersReduced ? {} : fadeUp

  return (
    <section
      id="ai"
      aria-labelledby="ai-heading"
      className="px-[clamp(24px,5vw,80px)] py-[128px] border-t border-b border-[var(--border)]"
      style={{
        background: `
          radial-gradient(ellipse at 30% 60%, rgba(99,153,255,0.42) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 20%, rgba(180,120,255,0.38) 0%, transparent 58%),
          radial-gradient(ellipse at 50% 100%, rgba(1,180,175,0.30) 0%, transparent 60%),
          #060c12
        `,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center">
        {/* Text */}
        <motion.div {...mp}>
          <div className="inline-flex items-center gap-[7px] px-[14px] py-1 rounded-full bg-[rgba(99,153,255,0.12)] border border-[rgba(99,153,255,0.38)] text-[#94b8ff] text-[12px] font-medium mb-6">
            ✦ Intelligence layer
          </div>
          <h2
            id="ai-heading"
            className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-5"
          >
            Real-time routing.
            <br />
            <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}>
              Zero guesswork.
            </em>
          </h2>
          <p className="text-[17px] text-[var(--body)] max-w-[520px] leading-[1.7] mb-8">
            Tiera processes live spatial data, user context and environment mapping to deliver guidance that adapts as conditions change. Built for real buildings, with real people in mind.
          </p>
          <Link
            href="#"
            className="inline-flex items-center px-4 py-2 min-h-[44px] border border-[rgba(255,255,255,0.6)] rounded-[6px] text-[var(--text)] text-[13px] font-medium no-underline hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150"
          >
            View documentation →
          </Link>
        </motion.div>

        {/* Routing card UI */}
        <motion.div
          {...(prefersReduced
            ? {}
            : { ...fadeUp, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 } })}
          aria-label="Live navigation example"
        >
          <div className="rounded-[20px] bg-[rgba(3,17,25,0.85)] border border-[rgba(255,255,255,0.10)] p-6 max-w-[360px] mx-auto shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)]">Live navigation</span>
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--teal)]">
                <span className="block w-2 h-2 rounded-full bg-[var(--teal)]" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} aria-hidden="true" />
                Navigating
              </span>
            </div>

            {/* Route */}
            <div className="flex flex-col gap-0">
              {/* From */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-0 mt-1">
                  <div className="w-3 h-3 rounded-full bg-[rgba(1,180,175,0.25)] border-2 border-[var(--teal)]" />
                  <div className="w-px flex-1 min-h-[48px] border-l-2 border-dashed border-[rgba(1,180,175,0.30)] mt-1" />
                </div>
                <div className="pb-5">
                  <p className="text-[11px] text-[var(--muted)] mb-0.5">From</p>
                  <p className="text-[16px] font-medium text-[var(--text)]">Entrance</p>
                  <p className="text-[12px] text-[var(--muted)]">Ground floor</p>
                </div>
              </div>
              {/* To */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-[var(--teal)]" />
                </div>
                <div>
                  <p className="text-[11px] text-[var(--muted)] mb-0.5">To</p>
                  <p className="text-[16px] font-medium text-[var(--text)]">Cardiology</p>
                  <p className="text-[12px] text-[var(--muted)]">Floor 3, Room 12</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 h-px bg-[rgba(255,255,255,0.07)]" aria-hidden="true" />

            {/* Step indicator */}
            <div className="rounded-[12px] bg-[rgba(1,180,175,0.07)] border border-[rgba(1,180,175,0.18)] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[var(--muted)]">Step 3 of 7</span>
                <span className="text-[11px] text-[var(--teal)]">~4 min remaining</span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden mb-3">
                <div className="h-full w-[3/7] rounded-full bg-[var(--teal)]" style={{ width: '42%' }} />
              </div>
              <p className="text-[14px] font-medium text-[var(--text)]">Turn left in 4 metres</p>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">Then continue straight for 20 metres</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
