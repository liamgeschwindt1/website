import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CookieResetButton from '@/components/CookieResetButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — TouchPulse',
  description: 'Information about the cookies TouchPulse uses on its website.',
}

const LAST_UPDATED = '21 April 2025'

export default function CookiePolicyPage() {
  return (
    <>
      <Nav />
      <main className="px-[clamp(24px,5vw,80px)] py-[80px]">
        <div className="max-w-[720px] mx-auto">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--muted)' }}>Legal</p>
          <h1 className="text-[clamp(32px,4vw,52px)] font-medium tracking-[-0.02em] leading-[1.1] mb-3">Cookie Policy</h1>
          <p className="text-[14px] mb-12" style={{ color: 'var(--muted)' }}>Last updated: {LAST_UPDATED}</p>

          <div className="flex flex-col gap-10" style={{ color: 'rgba(247,247,247,0.7)' }}>
            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>What are cookies?</h2>
              <p className="text-[15px] leading-[1.75]">
                Cookies are small text files placed on your device when you visit a website. They allow the site to recognise your device on subsequent visits and remember your preferences. Under the Dutch Telecommunicatiewet (Tw) and EU ePrivacy Directive, we must inform you about cookies and, where required, obtain your consent before placing them.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Cookies we use</h2>

              {/* Strictly necessary */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Strictly necessary</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(1,180,175,0.15)', color: '#01b4af' }}>No consent required</span>
                </div>
                <table className="w-full text-[13px] border-collapse mb-2">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <Th>Cookie name</Th><Th>Purpose</Th><Th>Duration</Th><Th>Set by</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <Tr><Td><code>next-auth.session-token</code></Td><Td>Keeps CMS staff logged in (not set for public visitors)</Td><Td>Session</Td><Td>TouchPulse</Td></Tr>
                    <Tr><Td><code>tp_cookie_consent</code></Td><Td>Remembers your cookie preference so we don&apos;t ask again</Td><Td>1 year</Td><Td>TouchPulse</Td></Tr>
                  </tbody>
                </table>
                <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>These cookies are essential for the website to work and cannot be switched off.</p>
              </div>

              {/* Analytics */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Analytics</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(250,204,21,0.15)', color: '#facc15' }}>Consent required</span>
                </div>
                <table className="w-full text-[13px] border-collapse mb-2">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <Th>Cookie name</Th><Th>Purpose</Th><Th>Duration</Th><Th>Set by</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <Tr><Td><code>ph_*</code></Td><Td>PostHog project analytics — tracks page views, clicks, sessions, device info</Td><Td>1 year</Td><Td>PostHog (EU)</Td></Tr>
                    <Tr><Td><code>posthog-session</code></Td><Td>Links events within a single browsing session</Td><Td>30 min</Td><Td>PostHog (EU)</Td></Tr>
                  </tbody>
                </table>
                <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                  Analytics cookies are only placed when you click &quot;Accept all&quot;. Data is processed by PostHog Inc. on EU servers in Frankfurt, Germany. No data is stored outside the EU. PostHog does not use your data for advertising. See the <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#01b4af' }}>PostHog privacy policy</a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>What we track with analytics</h2>
              <p className="text-[15px] leading-[1.75] mb-4">When you consent to analytics cookies, we may collect:</p>
              <ul className="pl-5 flex flex-col gap-2 text-[15px] leading-[1.75]">
                <li>Pages you visit and how long you spend on them</li>
                <li>Buttons and links you click (automatically captured)</li>
                <li>How far you scroll down pages</li>
                <li>Session recordings (video-like replay of your visit — inputs such as email fields are masked and never recorded)</li>
                <li>Your browser, operating system, and device type</li>
                <li>Your approximate location (country and city, derived from IP — full IP addresses are not stored)</li>
                <li>The website that referred you to us (referrer)</li>
                <li>UTM campaign parameters in URLs</li>
              </ul>
              <p className="text-[15px] leading-[1.75] mt-4">We use this information to improve our website, understand what content is valuable, and measure the effectiveness of our marketing.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>Managing your preferences</h2>
              <p className="text-[15px] leading-[1.75] mb-4">
                You can change your cookie preferences at any time by clicking the button below.
              </p>
              <CookieResetButton />
              <p className="text-[14px] leading-[1.75] mt-4" style={{ color: 'var(--muted)' }}>
                You can also manage cookies through your browser settings or use browser extensions to block cookies. Note that blocking all cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>More information</h2>
              <p className="text-[15px] leading-[1.75]">
                For more information about how we handle your personal data, see our <Link href="/privacy" className="underline" style={{ color: '#01b4af' }}>Privacy Policy</Link>.
                If you have questions, contact us at <a href="mailto:privacy@touchpulse.nl" className="underline" style={{ color: '#01b4af' }}>privacy@touchpulse.nl</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t flex gap-6 text-[13px]" style={{ borderColor: 'var(--border)' }}>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors" style={{ color: 'var(--teal)' }}>Privacy Policy →</Link>
            <Link href="/" className="hover:text-[var(--text)] transition-colors" style={{ color: 'var(--muted)' }}>← Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left py-2 px-3 text-[11px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2.5 px-3 text-[13px] align-top" style={{ color: 'rgba(247,247,247,0.65)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{children}</td>
}
function Tr({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>
}
