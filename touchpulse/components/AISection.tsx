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
      className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-b border-[var(--border)]"
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

        {/* Code block */}
        <motion.div
          {...(prefersReduced
            ? {}
            : { ...fadeUp, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 } })}
        >
          <pre className="code-block" aria-label="Tiera navigation session JSON example" role="img">
            <code>
              <span className="cc">{'// Tiera live navigation'}</span>{'\n'}
              {'{'}{'\n'}
              {'  '}<span className="ck">&quot;session&quot;</span>{': '}<span className="cs">&quot;tp_7f3a9c&quot;</span>{','}{'\n'}
              {'  '}<span className="ck">&quot;user&quot;</span>{': { '}<span className="ck">&quot;name&quot;</span>{': '}<span className="cs">&quot;Sarah&quot;</span>{', '}<span className="ck">&quot;mode&quot;</span>{': '}<span className="cs">&quot;audio&quot;</span>{' },'}{'\n'}
              {'  '}<span className="ck">&quot;location&quot;</span>{': {'}{'\n'}
              {'    '}<span className="ck">&quot;lat&quot;</span>{': '}<span className="cn">51.4416</span>{', '}<span className="ck">&quot;lng&quot;</span>{': '}<span className="cn">5.4697</span>{','}{'\n'}
              {'    '}<span className="ck">&quot;floor&quot;</span>{': '}<span className="cn">2</span>{', '}<span className="ck">&quot;confidence&quot;</span>{': '}<span className="cn">0.97</span>{'\n'}
              {'  },'}{'\n'}
              {'  '}<span className="ck">&quot;instruction&quot;</span>{': '}<span className="cs">&quot;Turn left in 4 metres&quot;</span>{','}{'\n'}
              {'  '}<span className="ck">&quot;obstacle_detected&quot;</span>{': '}<span className="cn">false</span>{','}{'\n'}
              {'  '}<span className="ck">&quot;human_available&quot;</span>{': '}<span className="cn">true</span>{'\n'}
              {'}'}
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  )
}
