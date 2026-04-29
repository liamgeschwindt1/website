import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Tiera — Navigation built for real independence',
  description: 'Turn-by-turn audio navigation with live human support. Available now on iOS.',
}

// NOTE: FAQ content below should be replaced verbatim from the Tiera FAQ document
// when it becomes available. The structure is in place; just update the faq array.
const faq = [
  {
    q: 'Is Tiera free to download?',
    a: 'Yes. Tiera is free to download on the App Store. Live human navigator sessions may involve a per-minute charge. We will be transparent about any costs before you connect.',
  },
  {
    q: 'Which devices does Tiera support?',
    a: 'Tiera is currently available on iOS. An Android version is on our roadmap.',
  },
  {
    q: 'How does the live human navigator work?',
    a: 'Tap the Connect button in the app and you will be connected to a real person who can guide you turn by turn, read menus and signs, help identify objects, and assist with everyday tasks. They stay with you for as long as you need them.',
  },
  {
    q: 'Can I use Tiera with my screen off?',
    a: 'Yes. Once your route is active, your screen can stay in your pocket. Tiera gives spoken guidance throughout the journey.',
  },
  {
    q: 'What happens if I go off course?',
    a: 'Tiera detects when you have left your route and replans automatically. You will hear updated guidance within a few seconds.',
  },
  {
    q: 'What is a Checkpoint?',
    a: 'A Checkpoint is an orientation tool. Hold your phone out and Tiera uses haptic feedback — vibrations — to indicate when you are facing the right direction. You can trigger it at any point during your journey.',
  },
  {
    q: 'Does Tiera work indoors?',
    a: 'We are building indoor navigation, starting with routes created by Orientation and Mobility instructors using O&M Studio. Outdoor navigation is available now.',
  },
  {
    q: 'Is my data private?',
    a: 'We collect only what we need to operate the service. We do not sell your data. Our full privacy policy is at touchpulse.ai/privacy.',
  },
  {
    q: 'Is Tiera available on TestFlight?',
    a: 'Yes. If you want to try features before they reach the public App Store release, you can join the TestFlight beta.',
  },
  {
    q: 'I have more questions. How do I get in touch?',
    a: 'Email us at info@touchpulse.nl. We read everything.',
  },
]

export default function TieraPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        {/* ── Header ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="tiera-heading"
          className="px-[clamp(24px,5vw,80px)] py-[80px] border-b border-[var(--border)]"
        >
          <h1
            id="tiera-heading"
            className="text-[clamp(40px,5.5vw,68px)] font-medium tracking-[-0.03em] leading-[1.07] text-[var(--text)] max-w-[700px] mb-4"
          >
            Tiera. Navigation built for real independence.
          </h1>
          <p className="text-[18px] text-[var(--muted)]">Available now on iOS.</p>
        </section>

        {/* ── Alternating rows ───────────────────────────────────── */}
        <section aria-label="Product features" className="border-b border-[var(--border)]">
          {/* Row 1 — text left, image right */}
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] items-center border-b border-[var(--border)]">
            <div className="px-[clamp(24px,5vw,80px)] py-[80px]">
              <h2 className="text-[clamp(28px,3.2vw,42px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-5">
                Speak your destination.
              </h2>
              <p className="text-[17px] text-[var(--body)] leading-[1.75] max-w-[480px]">
                Type an address or speak it. Tiera plans your route and reads it back — distance, direction, time. Your screen can stay in your pocket.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="hidden lg:flex items-center justify-center border-l border-[var(--border)] h-full min-h-[320px]"
              style={{ backgroundColor: '#051520' }}
            >
              <span
                style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', color: 'var(--teal)', opacity: 0.3, fontSize: '1.25rem' }}
              >
                screenshot
              </span>
            </div>
          </div>

          {/* Row 2 — image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-[40fr_60fr] items-center border-b border-[var(--border)]">
            <div
              aria-hidden="true"
              className="hidden lg:flex items-center justify-center border-r border-[var(--border)] h-full min-h-[320px]"
              style={{ backgroundColor: '#051520' }}
            >
              <span
                style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', color: 'var(--teal)', opacity: 0.3, fontSize: '1.25rem' }}
              >
                screenshot
              </span>
            </div>
            <div className="px-[clamp(24px,5vw,80px)] py-[80px]">
              <h2 className="text-[clamp(28px,3.2vw,42px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-5">
                A real person on call.
              </h2>
              <p className="text-[17px] text-[var(--body)] leading-[1.75] max-w-[480px]">
                Tap once to connect to a live human navigator. They can guide you turn by turn, read menus and signs, help identify objects, and talk you through everyday tasks like reading a medication label or matching clothing.
              </p>
            </div>
          </div>

          {/* Row 3 — text left, image right */}
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] items-center">
            <div className="px-[clamp(24px,5vw,80px)] py-[80px]">
              <h2 className="text-[clamp(28px,3.2vw,42px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-5">
                Stay oriented, always.
              </h2>
              <p className="text-[17px] text-[var(--body)] leading-[1.75] max-w-[480px]">
                If you go off course Tiera replans instantly. Use Checkpoints at any time to reorient — hold your phone out and haptic feedback guides you to face the right direction.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="hidden lg:flex items-center justify-center border-l border-[var(--border)] h-full min-h-[320px]"
              style={{ backgroundColor: '#051520' }}
            >
              <span
                style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', color: 'var(--teal)', opacity: 0.3, fontSize: '1.25rem' }}
              >
                screenshot
              </span>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section
          aria-labelledby="faq-heading"
          style={{ backgroundColor: '#031119' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-b border-[var(--border)]"
        >
          <h2
            id="faq-heading"
            className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-12"
          >
            Frequently asked questions
          </h2>
          <div className="max-w-[720px] flex flex-col divide-y divide-[var(--border)]">
            {faq.map((item, i) => (
              <details key={i} className="group py-5">
                <summary
                  className="flex items-center justify-between cursor-pointer list-none text-[16px] font-medium text-[var(--text)] hover:text-[var(--teal)] transition-colors duration-150 [&amp;::-webkit-details-marker]:hidden"
                >
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="ml-4 flex-shrink-0 text-[var(--muted)] text-[20px] font-light leading-none select-none transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[15px] text-[var(--body)] leading-[1.75]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section
          aria-label="Download Tiera"
          className="px-[clamp(24px,5vw,80px)] py-[96px] text-center"
        >
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[6px] px-8 py-4 rounded-full bg-[var(--gold)] text-[#031119] text-[16px] font-semibold no-underline hover:opacity-90 transition-opacity duration-150 min-h-[52px]"
          >
            Download Tiera on the App Store
          </a>
          <p className="text-[13px] text-[var(--muted)] mt-4">
            iOS only · Also available on TestFlight
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}

