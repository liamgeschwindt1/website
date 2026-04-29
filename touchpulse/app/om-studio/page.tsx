import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'O&M Studio — TouchPulse',
  description: 'A professional tool for Orientation and Mobility instructors. Record routes, attach expert cues, deliver verified guidance through Tiera.',
}

export default function OMStudioPage() {
  return (
    <>
      <Nav />
      <main className="pt-[60px]">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section
          aria-labelledby="om-studio-heading"
          className="relative px-[clamp(24px,5vw,80px)] py-[96px] overflow-hidden border-b border-[var(--border)]"
        >
          {/* aurora tint */}
          <div aria-hidden="true" style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
            <div style={{ position:'absolute', width:'50%', height:'60%', top:'-10%', left:'-5%', borderRadius:'50%', background:'rgba(1,180,175,0.18)', filter:'blur(100px)' }} />
            <div style={{ position:'absolute', width:'40%', height:'50%', top:'-15%', right:'5%', borderRadius:'50%', background:'rgba(80,60,200,0.15)', filter:'blur(90px)' }} />
          </div>
          <div className="relative z-10 max-w-[700px]">
            <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-4" style={{ color:'var(--teal)' }}>
              ✦ FOR O&amp;M PROFESSIONALS
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-[12px] mb-6" style={{ background:'rgba(1,180,175,0.12)', border:'1px solid rgba(1,180,175,0.3)', color:'var(--teal)' }}>
              Coming soon — join the waitlist
            </div>
            <h1
              id="om-studio-heading"
              className="text-[clamp(40px,5.5vw,68px)] font-medium tracking-[-0.03em] leading-[1.07] text-[var(--text)] mb-6"
            >
              O&amp;M Studio.{' '}
              <em style={{ fontFamily:'var(--font-lora)', fontStyle:'italic', fontWeight:400, color:'var(--teal)' }}>
                Your expertise, everywhere.
              </em>
            </h1>
            <p className="text-[18px] text-[var(--body)] leading-[1.75] max-w-[560px] mb-8">
              Record routes in the field, attach professional cues to precise GPS locations, and deliver your expert guidance through Tiera — even when you are not there.
            </p>
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full no-underline min-h-[48px] transition-opacity duration-150 hover:opacity-90"
              style={{ background:'var(--gold)', color:'#031119', fontSize:14, fontWeight:500 }}
            >
              Join the waitlist
            </a>
          </div>
        </section>

        {/* ── Feature cards ─────────────────────────────────────── */}
        <section
          aria-label="O&M Studio features"
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-b border-[var(--border)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[48px] max-w-[1200px] mx-auto">
            {[
              {
                icon: '📍',
                title: 'GPS-attached cues',
                body: 'Walk a route and attach spoken instructions, landmark descriptions, and orientation notes to exact GPS positions. Your students hear them automatically at the right moment.',
              },
              {
                icon: '🎧',
                title: 'Delivered through Tiera',
                body: 'Routes you create in O&M Studio appear directly in the Tiera app for your students. Your professional guidance — without you having to be present for every practice session.',
              },
              {
                icon: '✏️',
                title: 'Edit from anywhere',
                body: 'Update cues, add new waypoints, and refine routes from your desktop or phone. Changes sync to your students immediately.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex flex-col gap-4">
                <div className="text-[28px]" aria-hidden="true">{icon}</div>
                <h3 className="text-[18px] font-medium text-[var(--text)]">{title}</h3>
                <p className="text-[15px] text-[var(--body)] leading-[1.75]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Vision statement ──────────────────────────────────── */}
        <section
          aria-labelledby="om-vision-heading"
          style={{ backgroundColor:'#F7F7F7' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-b border-[var(--border)]"
        >
          <div className="max-w-[700px] mx-auto">
            <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-10" style={{ color:'#4a6a5a' }}>
              ✦ WHY WE BUILT THIS
            </p>
            <div className="flex flex-col gap-8">
              {[
                { borderColor:'#01B4AF', text:'O&M instructors spend years building mental maps of cities, campuses, and buildings. Until now, that knowledge lived only in 1:1 sessions.' },
                { borderColor:'#01B4AF', text:'O&M Studio makes professional guidance scalable — a route recorded once can support hundreds of students independently navigating the same space.' },
                { borderColor:'#01B4AF', text:'We are building this with qualified O&M professionals. If that is you, join the waitlist and help us shape it.' },
              ].map(({ borderColor, text }, i) => (
                <div key={i} style={{ borderLeft:`4px solid ${borderColor}`, paddingLeft:28 }}>
                  <p className="text-[clamp(16px,1.6vw,18px)] leading-[1.75]" style={{ color:'#1a2e22' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Waitlist form ─────────────────────────────────────── */}
        <section
          id="waitlist"
          aria-labelledby="waitlist-heading"
          className="px-[clamp(24px,5vw,80px)] py-[96px]"
        >
          <div className="max-w-[560px]">
            <h2
              id="waitlist-heading"
              className="text-[clamp(24px,3vw,36px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-4"
            >
              Join the waitlist
            </h2>
            <p className="text-[16px] text-[var(--body)] leading-[1.7] mb-10">
              O&M Studio is in private beta. Leave your details and we will contact you when a spot opens.
            </p>
            <ContactForm source="om-studio" buttonLabel="Request access" />
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
