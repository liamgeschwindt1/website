import type { Metadata } from 'next'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import UserForm from '@/components/UserForm'

export const metadata: Metadata = {
  title: 'Get Tiera — Free navigation app for blind and low-vision users | Touchpulse',
  description:
    'Request access to Tiera, the free AI navigation app built for blind and low-vision users. Voice-first, 20 languages, real human backup.',
}

export default function GetTieraPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">

        {/* Hero */}
        <section
          aria-labelledby="get-tiera-heading"
          className="px-[clamp(24px,5vw,80px)] py-[80px] border-b border-[var(--border)]"
        >
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-[60px] items-center">
            <div>
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--teal)' }}>
                ✦ Tiera — free for everyone
              </p>
              <h1
                id="get-tiera-heading"
                className="text-[clamp(36px,5vw,64px)] font-medium tracking-[-0.03em] leading-[1.07] mb-6 text-[var(--text)]"
              >
                Navigate with confidence.
              </h1>
              <p className="text-[18px] text-[var(--body)] max-w-[520px] mb-6 leading-[1.7]">
                Tiera is a free AI navigation companion designed from the ground up for blind and low-vision users. Voice-first, 20 languages, and real human backup when you need it.
              </p>
              <ul className="flex flex-col gap-3 mb-8 text-[15px] text-[var(--body)]">
                {[
                  'Voice-first — keep your phone in your pocket throughout',
                  'Street names on turn and as you pass them',
                  'Checkpoints: know you\'re facing the right direction before you walk',
                  'One-tap live human support with Pathway',
                  'Free to download. Free to use.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 2 }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 flex-wrap">
                <a
                  href="https://apps.apple.com/nl/app/tiera/id6738327862"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill-gold"
                >
                  Download on iOS ↗
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=nl.touchpulse.navis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Android →
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[460px] aspect-[3/4] rounded-[20px] overflow-hidden border"
                style={{ borderColor: 'rgba(255,255,255,0.10)' }}
              >
                <Image
                  src="/images/photos/user-at-door.jpg"
                  alt="A person standing confidently at a doorway, ready to navigate"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 460px"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 55%, rgba(3,17,25,0.6) 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <UserForm />

      </main>
      <Footer />
    </>
  )
}
