import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Blog — TouchPulse',
  description: 'Thoughts on accessible navigation, orientation and mobility, and building Tiera.',
}

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        <section
          aria-labelledby="blog-heading"
          className="px-[clamp(24px,5vw,80px)] py-[80px] border-b border-[var(--border)]"
        >
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-4" style={{ color:'var(--teal)' }}>
            ✦ TOUCHPULSE BLOG
          </p>
          <h1
            id="blog-heading"
            className="text-[clamp(40px,5.5vw,68px)] font-medium tracking-[-0.03em] leading-[1.07] text-[var(--text)] mb-4"
          >
            Writing.
          </h1>
          <p className="text-[18px] text-[var(--body)] leading-[1.75] max-w-[560px]">
            Thoughts on accessible navigation, orientation and mobility, and how we are building Tiera.
          </p>
        </section>

        <section
          aria-label="Blog posts coming soon"
          className="px-[clamp(24px,5vw,80px)] py-[96px] flex items-center justify-center min-h-[40vh]"
        >
          <div className="text-center max-w-[460px]">
            <div
              className="inline-flex items-center px-4 py-2 rounded-full text-[12px] mb-6"
              style={{ background:'rgba(1,180,175,0.10)', border:'1px solid rgba(1,180,175,0.3)', color:'var(--teal)' }}
            >
              First posts coming soon
            </div>
            <p className="text-[16px] text-[var(--muted)] leading-[1.75]">
              We are writing about the technology, the people who use it, and the decisions behind what we build. Subscribe to stay updated.
            </p>
            <a
              href="mailto:info@touchpulse.nl"
              className="inline-flex items-center px-5 py-3 mt-8 no-underline transition-colors duration-150 min-h-[44px]"
              style={{ border:'0.5px solid var(--teal)', borderRadius:6, color:'var(--teal)', fontSize:14 }}
            >
              Notify me when posts are live
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
