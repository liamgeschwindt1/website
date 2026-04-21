'use client'

import { motion } from 'framer-motion'
import siteCopy from '@/content/siteCopy.json'

export default function ProofBar() {
  const stats = siteCopy.proofBar.stats
  const logos = ['Blind Veterans UK', 'NS', 'Radboud UMC', 'TU/e', 'ProRail', 'Blind Veterans UK', 'NS', 'Radboud UMC', 'TU/e', 'ProRail']

  return (
    <div>
      {/* Logo strip */}
      <div className="relative flex items-center gap-8 py-6 border-t border-[var(--border)] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} aria-hidden="true" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} aria-hidden="true" />

        <span className="flex-shrink-0 text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] whitespace-nowrap pl-[clamp(24px,5vw,80px)] z-20">
          {siteCopy.proofBar.trustedByLabel}
        </span>

        <div className="overflow-hidden flex-1" aria-label="Partner logos">
          <motion.div
            className="flex items-center gap-14 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
          >
            {logos.map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="text-[13px] text-[rgba(247,247,247,0.38)] font-medium tracking-[0.04em] uppercase flex-shrink-0"
              >
                {logo}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stat row */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--border)]"
        aria-label="Key statistics"
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center py-8 gap-1 ${i < stats.length - 1 ? 'border-r border-[var(--border)]' : ''}`}
          >
            <span className="text-[clamp(28px,3vw,40px)] font-medium tracking-[-0.03em] text-[var(--teal)]">
              {stat.number}
            </span>
            <span className="text-[12px] text-[var(--muted)] tracking-[0.02em] text-center px-2">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
