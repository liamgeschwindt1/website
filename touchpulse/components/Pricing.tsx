'use client'

import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

const plans = [
  {
    tier: 'Standard',
    name: 'Starter',
    desc: 'The starting point — unlimited access to Tiera so no visitor is ever left stuck.',
    features: [
      'Access to the Tiera app',
      'Monthly analytics + reporting',
      'Standard support',
    ],
    featured: false,
  },
  {
    tier: 'Most popular',
    name: 'Professional',
    desc: 'Tiera learns your building — entrances, lifts, toilets and every important detail.',
    features: [
      'Everything in Starter',
      'Location-specific training',
      'Staff workflow integration',
      'Priority support',
    ],
    featured: true,
  },
  {
    tier: 'Enterprise',
    name: 'Custom',
    desc: 'Workflow integration, detailed indoor guidance, or API connections. Let\'s talk.',
    features: [
      'Everything in Professional',
      'Custom API integration',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    featured: false,
  },
]

export default function Pricing() {
  const prefersReduced = useReducedMotion()
  const mp = prefersReduced ? {} : fadeUp

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
    >
      <motion.div {...mp}>
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
          Pricing
        </p>
        <h2
          id="pricing-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-14"
        >
          Straightforward tiers.
          <br />
          <em style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}>
            No hidden extras.
          </em>
        </h2>
      </motion.div>

      <motion.div
        {...(prefersReduced ? {} : { ...fadeUp, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 } })}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        role="list"
      >
        {plans.map((plan) => (
          <article
            key={plan.name}
            role="listitem"
            className={`rounded-[12px] p-8 bg-[var(--surface)] flex flex-col transition-colors duration-200 ${
              plan.featured
                ? 'border border-[var(--teal)]'
                : 'border border-[var(--border)] hover:border-[var(--border-hover)]'
            }`}
          >
            <p
              className={`text-[11px] font-medium tracking-[0.08em] uppercase mb-[10px] ${
                plan.featured ? 'text-[var(--teal)]' : 'text-[var(--muted)]'
              }`}
            >
              {plan.tier}
            </p>
            <h3 className="text-[22px] font-medium text-[var(--text)] mb-2 tracking-[-0.01em]">
              {plan.name}
            </h3>
            <p className="text-[14px] text-[var(--body)] mb-7 min-h-[44px] leading-[1.6]">
              {plan.desc}
            </p>
            <ul className="flex flex-col gap-[10px] flex-1" aria-label={`${plan.name} plan features`}>
              {plan.features.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2 text-[14px] text-[var(--body)] leading-[1.5]"
                >
                  <span className="text-[var(--teal)] text-[12px] mt-[2px] flex-shrink-0" aria-hidden="true">→</span>
                  {feat}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </motion.div>
    </section>
  )
}
