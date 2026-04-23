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

      {/* Stats section */}
      <section
        aria-label="Key statistics"
        className="border-b border-[var(--border)] py-16 px-[clamp(24px,5vw,80px)]"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-medium tracking-[0.1em] uppercase text-center mb-12"
          style={{ color: 'var(--muted)' }}
        >
          The numbers behind the mission
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 max-w-2xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="flex flex-col gap-2"
            >
              <span
                className="text-[clamp(44px,5vw,64px)] font-bold tracking-[-0.03em] leading-none"
                style={{ color: stat.color === 'gold' ? 'var(--gold)' : 'var(--teal)' }}
              >
                {stat.number}
              </span>
              <span className="text-[14px] leading-[1.5]" style={{ color: 'var(--body)' }}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
