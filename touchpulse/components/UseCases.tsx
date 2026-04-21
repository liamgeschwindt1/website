'use client'

import Link from 'next/link'
import { motion, useReducedMotion, Easing } from 'framer-motion'

const ease: Easing = [0.16, 1, 0.3, 1]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease },
}

const cases = [
  {
    sector: 'Retail',
    title: (
      <>
        Shop{' '}
        <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}>
          independently.
        </em>
      </>
    ),
    body: 'Tiera allows blind and low vision visitors to find exactly what they need without searching for a member of staff. A better experience for customers — and less pressure on your team.',
    link: 'Tiera for Retail →',
    icon: '🛍',
    label: 'Retail environment',
    flip: false,
  },
  {
    sector: 'Hospital',
    title: (
      <>
        Arrive{' '}
        <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}>
          calmly.
        </em>
      </>
    ),
    body: 'Seamless wayfinding from entrance to care spaces. A better patient experience, and fewer staff needed for escorts — helping everyone do their job better.',
    link: 'Tiera for Hospital →',
    icon: '🏥',
    label: 'Hospital wayfinding',
    flip: true,
  },
]

export default function UseCases() {
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="usecases"
      aria-labelledby="usecases-heading"
      className="px-[clamp(24px,5vw,80px)] py-[128px]"
    >
      <motion.div
        {...(prefersReduced ? {} : fadeUp)}
        className="mb-16"
      >
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
          Built for busy places
        </p>
        <h2
          id="usecases-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15]"
        >
          Wherever people go,
          <br />
          <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}>
            Tiera goes with them.
          </em>
        </h2>
      </motion.div>

      {cases.map((uc, i) => (
        <motion.div
          key={uc.sector}
          {...(prefersReduced ? {} : { ...fadeUp, transition: { duration: 0.6, ease, delay: i * 0.05 } })}
          className={`grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-[72px] items-center mb-[80px] pb-[80px] border-b border-[var(--border)] last:border-b-0 last:mb-0 last:pb-0 ${
            uc.flip ? 'lg:grid-cols-[45fr_55fr]' : ''
          }`}
        >
          <div className={uc.flip ? 'lg:order-2' : ''}>
            <div className="inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-full bg-[rgba(1,180,175,0.10)] border border-[rgba(1,180,175,0.35)] text-[var(--teal)] text-[11px] font-medium mb-4">
              ● {uc.sector}
            </div>
            <h3 className="text-[clamp(22px,2.8vw,32px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-3 leading-[1.2]">
              {uc.title}
            </h3>
            <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-5">{uc.body}</p>
            <Link
              href="#"
              className="inline-flex items-center gap-[5px] text-[var(--teal)] text-[14px] no-underline hover:gap-2 transition-all duration-150"
            >
              {uc.link}
            </Link>
          </div>

          <div
            className={`rounded-[12px] bg-[var(--surface)] border border-[var(--border)] h-[300px] relative overflow-hidden ${uc.flip ? 'lg:order-1' : ''}`}
            aria-label={uc.label}
          >
            {/* Ambient gradient */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, rgba(1,180,175,0.08) 0%, rgba(3,17,25,0.6) 100%)' }}
              aria-hidden="true"
            />
            {/* Decorative grid lines */}
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(var(--teal) 1px, transparent 1px), linear-gradient(90deg, var(--teal) 1px, transparent 1px)', backgroundSize: '40px 40px' }} aria-hidden="true" />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-7">
              <span className="text-[40px] mb-3" aria-hidden="true">{uc.icon}</span>
              <p className="text-[13px] font-medium tracking-[0.06em] uppercase text-[var(--teal)] mb-1">{uc.sector}</p>
              <p className="text-[15px] text-[var(--body)] leading-[1.5]">{uc.label}</p>
            </div>
          </div>
        </motion.div>
      ))}

      <motion.div
        {...(prefersReduced ? {} : { ...fadeUp, transition: { duration: 0.6, ease, delay: 0.1 } })}
        className="mt-8 flex justify-center"
      >
        <Link
          href="#contact"
          className="inline-flex items-center gap-1.5 text-[var(--teal)] text-[14px] no-underline hover:gap-3 transition-all duration-150"
        >
          View all sectors →
        </Link>
      </motion.div>
    </section>
  )
}
