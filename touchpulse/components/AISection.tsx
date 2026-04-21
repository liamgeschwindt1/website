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

        {/* Outdoor navigation visual */}
        <motion.div
          {...(prefersReduced
            ? {}
            : { ...fadeUp, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 } })}
          aria-label="Tiera outdoor navigation illustration"
        >
          <div className="rounded-[20px] bg-[rgba(3,17,25,0.85)] border border-[rgba(255,255,255,0.10)] p-6 max-w-[360px] mx-auto shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)]">Tiera — outdoor</span>
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--teal)]">
                <span className="block w-2 h-2 rounded-full bg-[var(--teal)]" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} aria-hidden="true" />
                Live
              </span>
            </div>

            {/* Environment */}
            <div className="rounded-[12px] bg-[rgba(1,180,175,0.07)] border border-[rgba(1,180,175,0.18)] px-4 py-3 mb-4">
              <p className="text-[11px] text-[var(--muted)] mb-1">Current environment</p>
              <p className="text-[15px] font-medium text-[var(--text)]">High Street — Eindhoven</p>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">Pedestrian zone · Good conditions</p>
            </div>

            {/* Step */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[16px]" style={{ background: 'rgba(1,180,175,0.15)' }}>→</div>
                <div>
                  <p className="text-[14px] font-medium text-[var(--text)]">Cross at the junction ahead</p>
                  <p className="text-[12px] text-[var(--muted)] mt-0.5">Audio signal active · 12 metres</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.03)', opacity: 0.6 }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[16px]" style={{ background: 'rgba(255,255,255,0.06)' }}>↑</div>
                <div>
                  <p className="text-[14px] font-medium text-[var(--text)]">Continue straight 80 metres</p>
                  <p className="text-[12px] text-[var(--muted)] mt-0.5">Destination on your left</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--muted)]">Human backup ready</span>
              <span className="text-[11px] text-[var(--teal)] font-medium">Tap to connect</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
