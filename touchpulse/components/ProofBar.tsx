'use client'

import { motion } from 'framer-motion'

export default function ProofBar() {
  const logos = ['Blind Veterans UK', 'NS', 'Radboud UMC', 'TU/e', 'ProRail', 'Blind Veterans UK', 'NS', 'Radboud UMC', 'TU/e', 'ProRail']

  return (
    <div className="relative flex items-center gap-8 py-6 border-t border-b border-[var(--border)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} aria-hidden="true" />

      <span className="flex-shrink-0 text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] whitespace-nowrap pl-[clamp(24px,5vw,80px)] z-20">
        Trusted by
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
  )
}
