'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

export default function Hero() {
  const prefersReduced = useReducedMotion()

  const motionProps = prefersReduced ? {} : fadeUp

  return (
    <section
      aria-label="Hero"
      className="relative min-h-screen flex items-center px-[clamp(24px,5vw,80px)] pt-[120px] pb-[80px] overflow-hidden"
    >
      <div className="hero-aurora" aria-hidden="true">
        <div className="hero-aurora-blob" />
        <div className="hero-aurora-blob" />
        <div className="hero-aurora-blob" />
      </div>
      <div className="grain" aria-hidden="true" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center w-full max-w-[1280px]">
        {/* Left */}
        <motion.div {...motionProps}>
          <div className="inline-flex items-center gap-[7px] px-[14px] py-1 rounded-full bg-[rgba(1,180,175,0.10)] border border-[rgba(1,180,175,0.38)] text-[var(--teal)] text-[12px] font-medium mb-7">
            ✦ AI-powered navigation
          </div>

          <h1
            className="text-[clamp(44px,5.5vw,72px)] font-medium leading-[1.06] tracking-[-0.03em] mb-3"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Every person.<br />
            Every{' '}
            <em
              className="not-italic"
              style={{
                fontFamily: 'var(--font-lora)',
                fontStyle: 'italic',
                fontWeight: 400,
                background: 'linear-gradient(135deg, var(--teal) 20%, #7ff8f6 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              journey.
            </em>
            <br />
            With confidence.
          </h1>

          <p className="text-[17px] text-[var(--body)] max-w-[480px] mb-9 leading-[1.7]">
            TouchPulse turns any building or street into a clear,
            confident path — powered by Tiera AI and real human backup.
          </p>

          <div className="flex items-center gap-[14px] flex-wrap mb-12">
            <Link
              href="#contact"
              className="inline-flex items-center gap-[6px] px-[22px] py-[10px] rounded-[6px] bg-[var(--gold)] text-[#031119] text-[14px] font-medium no-underline hover:opacity-90 transition-opacity duration-150 min-h-[44px]"
            >
              Get started ↗
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center px-4 py-2 min-h-[44px] border border-[rgba(255,255,255,0.6)] rounded-[6px] text-[var(--text)] text-[13px] font-medium no-underline hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150"
            >
              See how it works →
            </Link>
          </div>

          <div className="flex items-center gap-[10px] text-[13px] text-[var(--muted)]">
            <span className="block w-5 h-px bg-[var(--muted)]" aria-hidden="true" />
            2.4M routes completed. Real people. Real independence.
          </div>
        </motion.div>

        {/* Right — SVG route map + testimonial card */}
        <motion.div
          className="relative hidden md:block"
          {...(prefersReduced
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 },
              })}
        >
          {/* Animated route SVG — background layer */}
          <svg
            viewBox="0 0 320 320"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {/* Grid dots */}
            {[60,120,180,240].map(x =>
              [60,120,180,240].map(y => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="#01B4AF" fillOpacity="0.12" />
              ))
            )}
            {/* Route path */}
            <path
              d="M60,260 L200,260 L200,160 L260,160 L260,70"
              fill="none"
              stroke="#01B4AF"
              strokeOpacity="0.30"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 5"
            />
            {/* Waypoint rings */}
            <circle cx="60" cy="260" r="5" fill="none" stroke="#01B4AF" strokeOpacity="0.50" strokeWidth="1.5" />
            <circle cx="60" cy="260" r="2.5" fill="#01B4AF" fillOpacity="0.70" />
            <circle cx="200" cy="260" r="5" fill="none" stroke="#01B4AF" strokeOpacity="0.50" strokeWidth="1.5" />
            <circle cx="200" cy="260" r="2.5" fill="#01B4AF" fillOpacity="0.70" />
            <circle cx="200" cy="160" r="5" fill="none" stroke="#01B4AF" strokeOpacity="0.50" strokeWidth="1.5" />
            <circle cx="200" cy="160" r="2.5" fill="#01B4AF" fillOpacity="0.70" />
            <circle cx="260" cy="70" r="5" fill="none" stroke="#01B4AF" strokeOpacity="0.50" strokeWidth="1.5" />
            <circle cx="260" cy="70" r="2.5" fill="#01B4AF" fillOpacity="0.70" />
            {/* Moving dot — pulse halo + core */}
            {!prefersReduced && (
              <>
                <circle r="10" fill="#01B4AF" fillOpacity="0.15">
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M60,260 L200,260 L200,160 L260,160 L260,70"
                    calcMode="linear"
                  />
                </circle>
                <circle r="5" fill="#01B4AF" fillOpacity="0.85">
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M60,260 L200,260 L200,160 L260,160 L260,70"
                    calcMode="linear"
                  />
                </circle>
              </>
            )}
            {prefersReduced && (
              <circle cx="260" cy="70" r="5" fill="#01B4AF" fillOpacity="0.85" />
            )}
          </svg>

          {/* Testimonial card — overlaid on top of SVG */}
          <div className="relative z-10 bg-[rgba(27,53,79,0.55)] border border-[rgba(255,255,255,0.10)] rounded-[16px] p-8 backdrop-blur-[12px]">
            {/* teal gradient overlay */}
            <div
              className="absolute inset-0 rounded-[16px] pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(1,180,175,0.06), transparent 60%)' }}
              aria-hidden="true"
            />

            {/* partner badge */}
            <div className="absolute -top-[14px] right-6 inline-flex items-center gap-[6px] px-3 py-1 rounded-full bg-[rgba(10,30,45,0.75)] border border-[rgba(255,177,0,0.55)] text-[var(--gold)] text-[11px] font-medium backdrop-blur-md">
              ✦ Blind Veterans UK
            </div>

            <span
              aria-hidden="true"
              className="block text-[48px] leading-none text-[var(--teal)] opacity-60 mb-1"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              "
            </span>

            <blockquote
              className="text-[17px] text-[var(--body)] leading-[1.65] mb-5"
              style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
            >
              As a user, I have experienced how much more confident and informed a journey can feel when technology is designed around{' '}
              <strong className="not-italic text-[var(--text)] font-medium" style={{ fontFamily: 'var(--font-inter)', fontSize: '15px' }}>
                real needs.
              </strong>
            </blockquote>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 min-w-[40px] rounded-full bg-[rgba(1,180,175,0.15)] border border-[rgba(1,180,175,0.35)] flex items-center justify-center text-[13px] font-medium text-[var(--teal)]"
                aria-hidden="true"
              >
                RJ
              </div>
              <div>
                <div className="text-[13px] font-medium text-[var(--text)]">Richard Jenkins</div>
                <div className="text-[12px] text-[var(--muted)]">Technology leader &amp; sight loss advocate</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
