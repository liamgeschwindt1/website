'use client'

import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSectionView } from '@/lib/posthog'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

const cards = [
  {
    title: 'Safe navigation',
    body: 'Tiera knows exactly where you are. It delivers precise, step-by-step guidance so people can move through any space on their own terms — no guessing, no stress.',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--teal)" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    ),
  },
  {
    title: 'Human support',
    body: 'A real person is always just a tap away. Professional guides available 24/7 — for the moments that need more than technology, there\'s a human voice ready to help.',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--teal)" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'AI vision',
    body: 'On-device intelligence spots obstacles, reads signs, and identifies landmarks in real time. Tiera sees the world so you can move through it freely.',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--teal)" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export default function Features() {
  const prefersReduced = useReducedMotion()
  const mp = prefersReduced ? {} : fadeUp
  const sectionRef = useRef<HTMLElement>(null)
  useSectionView(sectionRef, 'features')

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-heading"
      className="px-[clamp(24px,5vw,80px)] pb-[128px]"
    >
      <motion.div {...mp} className="mb-14">
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
          How it works
        </p>
        <h2
          id="features-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-4"
        >
          Three layers.{' '}
          <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}>
            No one left stranded.
          </em>
        </h2>
        <p className="text-[17px] text-[var(--body)] max-w-[520px] leading-[1.7]">
          Tiera combines AI precision with human warmth to make every environment navigable — for every person, every time.
        </p>
      </motion.div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)]"
        role="list"
      >
        {cards.map((card, i) => (
          <motion.article
            key={card.title}
            role="listitem"
            {...(prefersReduced
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.1 },
                })}
            className="group relative bg-[var(--bg)] p-10 border-l-4 border-l-[var(--teal)] overflow-hidden cursor-default"
            whileHover={prefersReduced ? {} : { y: -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
          >
            {/* hover shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(1,180,175,0.06) 0%, transparent 60%)' }} aria-hidden="true" />
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(1,180,175,0.10)] border border-[rgba(1,180,175,0.25)] flex items-center justify-center mb-5">
              {card.icon}
            </div>
            <h3 className="text-[19px] font-medium text-[var(--text)] mb-[10px] tracking-[-0.01em]">
              {card.title}
            </h3>
            <p className="text-[15px] text-[var(--body)] leading-[1.7]">{card.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
