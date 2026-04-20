'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

export default function StorySection() {
  const prefersReduced = useReducedMotion()
  const mp = prefersReduced ? {} : fadeUp

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="px-[clamp(24px,5vw,80px)] py-[96px] grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center"
    >
      {/* Text */}
      <motion.div {...mp}>
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
          The problem
        </p>
        <h2
          id="story-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-5"
        >
          Busy places can feel{' '}
          <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400, color: 'var(--teal)' }}>
            isolating
          </em>{' '}
          with sight loss.
        </h2>
        <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-4 max-w-[480px]">
          Airports. Hospitals. Shopping centres. These are places designed for everyone — yet for the 2.2 billion people worldwide living with vision impairment, they can feel impossible to navigate alone.
        </p>
        <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-6 max-w-[480px]">
          The stress of getting lost, the reliance on staff, the loss of independence — these aren&#39;t small inconveniences. They shape how people move through the world.
        </p>
        <Link
          href="#"
          className="inline-flex items-center gap-[5px] text-[var(--teal)] text-[14px] no-underline hover:gap-2 transition-all duration-150"
        >
          Read the research →
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        {...(prefersReduced ? {} : { ...fadeUp, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 } })}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6 hover:border-[var(--border-hover)] transition-colors duration-200">
            <div className="text-[36px] font-medium tracking-[-0.03em] text-[var(--text)] leading-none">2.2B</div>
            <div className="text-[13px] text-[var(--muted)] mt-[6px]">People with vision impairment globally</div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6 hover:border-[var(--border-hover)] transition-colors duration-200">
            <div className="text-[36px] font-medium tracking-[-0.03em] text-[var(--text)] leading-none">97%</div>
            <div className="text-[13px] text-[var(--muted)] mt-[6px]">Navigation accuracy with Tiera</div>
            <div className="text-[12px] text-[var(--teal)] mt-1">↑ 3pts vs last quarter</div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6 hover:border-[var(--border-hover)] transition-colors duration-200">
          <div className="text-[36px] font-medium tracking-[-0.03em] text-[var(--text)] leading-none">2.4M</div>
          <div className="text-[13px] text-[var(--muted)] mt-[6px]">Routes completed across all partner locations</div>
          <div className="text-[12px] text-[var(--teal)] mt-1">↑ 18% this month</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6 hover:border-[var(--border-hover)] transition-colors duration-200">
          <div className="text-[36px] font-medium tracking-[-0.03em] text-[var(--text)] leading-none">24/7</div>
          <div className="text-[13px] text-[var(--muted)] mt-[6px]">Human guide support — always a real person as backup</div>
        </div>
      </motion.div>
    </section>
  )
}
