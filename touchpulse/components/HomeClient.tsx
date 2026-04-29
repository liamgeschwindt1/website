'use client'

import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

/* ── Shared helpers ──────────────────────────────────────────────── */

function IPhoneMockup({ label = 'Tiera', accent = '#01B4AF' }: { label?: string; accent?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 'clamp(160px,22vw,270px)',
        aspectRatio: '9/19.5',
        borderRadius: '2.6rem',
        border: '6px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(170deg,#061a2c 0%,#031119 100%)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.55)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* notch */}
      <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', width:60, height:8, borderRadius:4, background:'rgba(255,255,255,0.08)' }} />
      {/* screen content mockup */}
      <div style={{ width:'80%', display:'flex', flexDirection:'column', gap:8, marginTop:24 }}>
        <div style={{ height:6, borderRadius:3, background:accent, opacity:0.7, width:'60%' }} />
        <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.15)', width:'90%' }} />
        <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.10)', width:'75%' }} />
        <div style={{ height:40, borderRadius:8, background:`${accent}22`, border:`1px solid ${accent}44`, marginTop:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:10, color:accent, fontFamily:'var(--font-lora)', fontStyle:'italic' }}>{label}</span>
        </div>
        <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.10)', width:'85%', marginTop:4 }} />
        <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.07)', width:'65%' }} />
        <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.07)', width:'80%' }} />
        <div style={{ height:32, borderRadius:6, background:accent, marginTop:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:9, color:'#031119', fontWeight:500 }}>Navigate →</span>
        </div>
      </div>
    </div>
  )
}

function CallUIMockup() {
  return (
    <div
      aria-hidden="true"
      style={{
        width:'100%', maxWidth:320,
        borderRadius:'1.5rem',
        border:'1px solid rgba(1,180,175,0.2)',
        background:'rgba(27,53,79,0.35)',
        padding:24,
        display:'flex', flexDirection:'column', gap:16,
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(1,180,175,0.15)', border:'2px solid var(--teal)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:18 }}>👤</span>
        </div>
        <div>
          <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>Navigator connected</div>
          <div style={{ fontSize:11, color:'var(--teal)', display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--teal)', display:'inline-block' }} />
            Live · 0:32
          </div>
        </div>
      </div>
      <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(1,180,175,0.08)', fontSize:12, color:'var(--body)', lineHeight:1.6 }}>
        &quot;Turn left in 20 metres — the entrance is on your right, glass doors.&quot;
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1, height:36, borderRadius:8, background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#f87171' }}>End call</div>
        <div style={{ flex:1, height:36, borderRadius:8, background:'rgba(1,180,175,0.1)', border:'1px solid rgba(1,180,175,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--teal)' }}>Mute</div>
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function HomeClient() {
  return (
    <>
      <Nav />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────── */}
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

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-[60px] items-center w-full max-w-[1280px] mx-auto">
            {/* Left */}
            <div>
              <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-5"
                 style={{ color:'var(--teal)' }}>
                <span style={{ color:'var(--teal)' }}>✦</span> AI-POWERED NAVIGATION
              </p>
              <h1 className="text-[clamp(40px,5.5vw,70px)] font-medium leading-[1.06] tracking-[-0.03em] mb-6 text-[var(--text)]">
                Every person. Every journey.{' '}
                <em style={{ fontFamily:'var(--font-lora)', fontStyle:'italic', fontWeight:400, color:'var(--teal)' }}>
                  Real confidence.
                </em>
              </h1>
              <p className="text-[18px] text-[var(--body)] max-w-[500px] mb-9 leading-[1.7]">
                Tiera turns any street or building into a clear step-by-step guide — powered by AI and real human navigators.
              </p>
              <div className="flex items-center gap-[14px] flex-wrap">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full no-underline min-h-[48px] transition-opacity duration-150 hover:opacity-90"
                  style={{ background:'var(--gold)', color:'#031119', fontSize:14, fontWeight:500 }}
                >
                  Download Tiera free
                </a>
                <a
                  href="#how-tiera-works"
                  className="inline-flex items-center px-5 py-3 no-underline min-h-[48px] transition-colors duration-150"
                  style={{ border:'0.5px solid rgba(255,255,255,0.7)', borderRadius:6, color:'var(--text)', fontSize:14 }}
                >
                  See how it works →
                </a>
              </div>
            </div>

            {/* Right — iPhone mockup */}
            <div className="flex justify-center lg:justify-end">
              <IPhoneMockup label="Tiera" />
            </div>
          </div>

          {/* fade to bg at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" aria-hidden="true"
               style={{ background:'linear-gradient(to bottom, transparent, var(--bg))' }} />
        </section>

        {/* ── What Tiera does ───────────────────────────────────────── */}
        <section
          id="how-tiera-works"
          aria-labelledby="what-tiera-heading"
          style={{ backgroundColor:'#F7F7F7' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px]"
        >
          <div className="max-w-[800px] mx-auto">
            <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-10" style={{ color:'#4a6a5a' }}>
              <span style={{ color:'#01B4AF' }}>✦</span> WHAT TIERA DOES
            </p>
            <div className="flex flex-col gap-10">
              {[
                'Turn-by-turn audio navigation. Speak your destination or type it — Tiera guides you step by step with your screen off.',
                'Live human support. Connect to a real navigator in seconds. They can guide you through complex spaces, read printed text, and help with everyday tasks.',
                'Orientation tools. At any point ask Tiera to help you face the right direction using haptic feedback and your camera.',
              ].map((text, i) => (
                <div key={i} style={{ borderLeft:'4px solid #01B4AF', paddingLeft:28 }}>
                  <p className="text-[clamp(16px,1.7vw,19px)] leading-[1.7]" style={{ color:'#1a2e22' }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section
          aria-labelledby="how-it-works-heading"
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
          style={{ backgroundColor:'#031119' }}
        >
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-4" style={{ color:'var(--teal)' }}>
            ✦ HOW IT WORKS
          </p>
          <h2 id="how-it-works-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-12 max-w-[600px]">
            Up and running in minutes.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n:'1', text:'Download and set up in minutes.' },
              { n:'2', text:'Speak your destination or type it.' },
              { n:'3', text:'Follow audio turn-by-turn, or connect to a live human navigator.' },
            ].map(({ n, text }) => (
              <div key={n} style={{ borderLeft:'4px solid var(--teal)', paddingLeft:20 }}>
                <div className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color:'var(--teal)' }}>Step {n}</div>
                <p className="text-[16px] text-[var(--body)] leading-[1.7]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Teleassistance ────────────────────────────────────────── */}
        <section
          aria-labelledby="teleassistance-heading"
          style={{ backgroundColor:'#F7F7F7' }}
          className="px-[clamp(24px,5vw,80px)] py-[96px]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-[60px] items-center max-w-[1200px] mx-auto">
            <div>
              <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-4" style={{ color:'#01B4AF' }}>
                ✦ LIVE SUPPORT
              </p>
              <h2 id="teleassistance-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] leading-[1.15] mb-6" style={{ color:'#031119' }}>
                A real person, when you need one.
              </h2>
              <p className="text-[17px] leading-[1.75] mb-8 max-w-[500px]" style={{ color:'rgba(3,17,25,0.7)' }}>
                Live agents can guide you through complex spaces, read menus and signs, help identify objects, and assist with everyday tasks like reading medication labels or matching clothing.
              </p>
              <Link
                href="/tiera"
                className="inline-flex items-center px-5 py-3 no-underline transition-colors duration-150 min-h-[44px]"
                style={{ border:'0.5px solid #01B4AF', borderRadius:6, color:'#01B4AF', fontSize:14 }}
              >
                Learn more about Tiera →
              </Link>
            </div>
            <div className="flex justify-center">
              <CallUIMockup />
            </div>
          </div>
        </section>

        {/* ── O&M Studio teaser ─────────────────────────────────────── */}
        <section
          aria-labelledby="om-teaser-heading"
          className="relative px-[clamp(24px,5vw,80px)] py-[96px] overflow-hidden"
          style={{ backgroundColor:'#060c12' }}
        >
          {/* Aurora variant */}
          <div aria-hidden="true" style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
            <div style={{ position:'absolute', width:'60%', height:'60%', top:'10%', left:'-10%', borderRadius:'50%', background:'rgba(1,180,175,0.25)', filter:'blur(90px)' }} />
            <div style={{ position:'absolute', width:'50%', height:'50%', top:'-20%', right:'0%', borderRadius:'50%', background:'rgba(80,60,200,0.2)', filter:'blur(90px)' }} />
            <div style={{ position:'absolute', width:'40%', height:'40%', bottom:'-10%', left:'40%', borderRadius:'50%', background:'rgba(27,53,79,0.6)', filter:'blur(80px)' }} />
          </div>
          <div className="relative z-10 max-w-[700px]">
            <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-4" style={{ color:'var(--teal)' }}>
              ✦ FOR O&amp;M PROFESSIONALS
            </p>
            <h2 id="om-teaser-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-5">
              For O&amp;M Instructors.
            </h2>
            <p className="text-[17px] text-[var(--body)] leading-[1.75] mb-6 max-w-[540px]">
              Record routes in the field, attach professional cues to precise GPS locations, and deliver your expert guidance through Tiera — even when you&apos;re not there.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-[12px] mb-8" style={{ background:'rgba(1,180,175,0.12)', border:'1px solid rgba(1,180,175,0.3)', color:'var(--teal)' }}>
              Coming soon — join the waitlist
            </div>
            <div>
              <a
                href="https://studio.touchpulse.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-3 no-underline transition-colors duration-150 min-h-[44px]"
                style={{ border:'0.5px solid rgba(255,255,255,0.7)', borderRadius:6, color:'var(--text)', fontSize:14 }}
              >
                Go to O&amp;M Studio ↗
              </a>
            </div>
          </div>
        </section>

        {/* ── What's coming ─────────────────────────────────────────── */}
        <section
          aria-labelledby="whats-coming-heading"
          className="px-[clamp(24px,5vw,80px)] py-[96px] border-t border-[var(--border)]"
          style={{ backgroundColor:'#031119' }}
        >
          <h2 id="whats-coming-heading" className="text-[clamp(28px,3.5vw,44px)] font-medium tracking-[-0.02em] text-[var(--text)] mb-12">
            What&apos;s coming.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[48px]">
            <div>
              <h3 className="text-[20px] font-medium text-[var(--text)] mb-4">O&amp;M Studio</h3>
              <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-6">
                A professional tool for Orientation and Mobility instructors to record routes in the field, attach expert cues to precise GPS locations, and deliver verified guidance through Tiera.
              </p>
              <a
                href="https://studio.touchpulse.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 no-underline transition-colors duration-150 min-h-[44px]"
                style={{ border:'0.5px solid rgba(255,255,255,0.5)', borderRadius:6, color:'var(--text)', fontSize:14 }}
              >
                Go to O&amp;M Studio ↗
              </a>
            </div>
            <div>
              <h3 className="text-[20px] font-medium text-[var(--text)] mb-4">Partner integrations</h3>
              <p className="text-[16px] text-[var(--body)] leading-[1.75] mb-6">
                We are building tools for organisations — universities, transit authorities, hospitals — to deploy Tiera for their users and staff. If you represent an organisation, we want to hear from you.
              </p>
              <Link
                href="/partners"
                className="inline-flex items-center px-5 py-2.5 no-underline transition-colors duration-150 min-h-[44px]"
                style={{ border:'0.5px solid rgba(255,255,255,0.5)', borderRadius:6, color:'var(--text)', fontSize:14 }}
              >
                Partner with us →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <section
          aria-label="Download CTA"
          className="relative px-[clamp(24px,5vw,80px)] py-[96px] text-center overflow-hidden"
        >
          <div className="hero-aurora" aria-hidden="true">
            <div className="hero-aurora-blob" />
            <div className="hero-aurora-blob" />
            <div className="hero-aurora-blob" />
          </div>
          <div className="grain" aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="text-[clamp(28px,4vw,52px)] font-medium tracking-[-0.03em] text-[var(--text)] mb-8">
              Start navigating with{' '}
              <em style={{ fontFamily:'var(--font-lora)', fontStyle:'italic', fontWeight:400, color:'var(--teal)' }}>
                confidence.
              </em>
            </h2>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full no-underline min-h-[52px] transition-opacity duration-150 hover:opacity-90"
              style={{ background:'var(--gold)', color:'#031119', fontSize:15, fontWeight:500 }}
            >
              Download Tiera free
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
