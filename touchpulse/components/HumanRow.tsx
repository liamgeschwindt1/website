'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

export default function HumanRow() {
  const prefersReduced = useReducedMotion()
  const mp = prefersReduced ? {} : fadeUp

  return (
    <section
      id="partners"
      aria-labelledby="human-heading"
      className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
    >
      <motion.div {...mp} className="grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-start">
        {/* Pull quote side */}
        <div>
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Partnership
          </p>
          <blockquote
            id="human-heading"
            className="text-[clamp(22px,2.5vw,30px)] leading-[1.45] tracking-[-0.01em] text-[var(--text)] border-l-[3px] border-l-[var(--teal)] pl-7 mb-7"
            style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 400 }}
          >
            &ldquo;What has impressed me most about Tiera is that this is not innovation for its own sake.&rdquo;
          </blockquote>
          <p className="text-[14px] text-[var(--muted)] pl-[31px] mb-7">
            <strong className="text-[var(--body)] font-medium">Richard Jenkins</strong> — Technology leader &amp; sight loss advocate, Blind Veterans UK
          </p>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6 flex items-center gap-4">
            <div
              className="w-12 h-12 min-w-[48px] rounded-full bg-[rgba(1,180,175,0.12)] border border-[rgba(1,180,175,0.35)] flex items-center justify-center text-[18px] text-[var(--teal)]"
              aria-hidden="true"
            >
              ✦
            </div>
            <div>
              <p className="text-[14px] font-medium text-[var(--text)]">Blind Veterans UK</p>
              <span className="text-[13px] text-[var(--muted)]">Official partner — supporting veterans with sight loss since 2024</span>
            </div>
          </div>
        </div>

        {/* Story side */}
        <div>
          <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-4">
            Richard joined the Royal Navy straight from school. A degenerative optic nerve condition ended his service — but not his ambition. After rehabilitation, he rebuilt his career in technology, working with global organisations on AI and digital transformation.
          </p>
          <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-4">
            Today he combines that experience with lived expertise in sight loss, helping shape technology that reflects real needs rather than assumptions. He sees in Tiera something rare: a team that listens, learns fast, and builds with genuine purpose.
          </p>
          <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-7">
            That&#39;s why Blind Veterans UK chose to partner with us. It&#39;s not about the technology. It&#39;s about what the technology makes possible for real people.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-[5px] text-[var(--teal)] text-[14px] no-underline hover:gap-2 transition-all duration-150"
          >
            Read Richard&#39;s full story →
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
