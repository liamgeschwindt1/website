import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — TouchPulse',
  description: 'How TouchPulse collects, uses, and protects your personal data in accordance with GDPR and Dutch AVG law.',
}

const LAST_UPDATED = '21 April 2025'
const COMPANY = 'TouchPulse B.V.'
const ADDRESS = 'Het Eeuwsel 57, 5612 AS Eindhoven, Netherlands'
const EMAIL = 'privacy@touchpulse.nl'
const DPA_AUTHORITY = 'Autoriteit Persoonsgegevens (AP)'
const DPA_URL = 'https://www.autoriteitpersoonsgegevens.nl'

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="px-[clamp(24px,5vw,80px)] py-[80px]">
        <div className="max-w-[720px] mx-auto">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--muted)' }}>Legal</p>
          <h1 className="text-[clamp(32px,4vw,52px)] font-medium tracking-[-0.02em] leading-[1.1] mb-3">Privacy Policy</h1>
          <p className="text-[14px] mb-12" style={{ color: 'var(--muted)' }}>Last updated: {LAST_UPDATED}</p>

          <Prose>
            <Section title="1. Who we are">
              <p>{COMPANY} (&quot;TouchPulse&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the controller of the personal data described in this policy.</p>
              <ul>
                <li><strong>Company:</strong> {COMPANY}</li>
                <li><strong>Address:</strong> {ADDRESS}</li>
                <li><strong>Email:</strong> <a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                <li><strong>Chamber of Commerce (KvK):</strong> [to be completed]</li>
              </ul>
            </Section>

            <Section title="2. What data we collect and why">
              <h3>2.1 Contact form</h3>
              <p>When you fill in our contact form we collect: name, email address, company name (optional), and your message. We use this data to respond to your enquiry. <strong>Legal basis: legitimate interest (Art. 6(1)(f) GDPR)</strong> — specifically our interest in responding to business communication.</p>

              <h3>2.2 Analytics (with consent)</h3>
              <p>If you consent to analytics cookies, we collect: pages visited, time on page, click events, scroll depth, browser type, operating system, device type, screen resolution, approximate location (country/city level via IP — IP addresses are not stored in full), referrer URL, and session recordings. We use <strong>PostHog</strong> as our analytics processor, hosted on EU servers (Frankfurt, Germany). <strong>Legal basis: consent (Art. 6(1)(a) GDPR)</strong>. You may withdraw consent at any time via the cookie settings link in the footer.</p>

              <h3>2.3 Strictly necessary cookies</h3>
              <p>We set one session cookie to keep you logged in to our CMS (staff only). No consent required. <strong>Legal basis: legitimate interest</strong>.</p>

              <h3>2.4 Server logs</h3>
              <p>Our hosting provider (Railway, Inc., US — covered by EU Standard Contractual Clauses) may log your IP address and request metadata for up to 7 days for security and stability purposes. We do not access these logs in ordinary operation.</p>
            </Section>

            <Section title="3. How we use your data">
              <ul>
                <li>To respond to your contact form enquiry</li>
                <li>To improve our website and product (analytics, with consent)</li>
                <li>To ensure the security and technical operation of our services</li>
              </ul>
              <p>We do not use your data for automated decision-making or profiling that produces legal effects.</p>
            </Section>

            <Section title="4. Who we share data with">
              <p>We use the following sub-processors under Data Processing Agreements:</p>
              <table>
                <thead>
                  <tr><th>Sub-processor</th><th>Purpose</th><th>Location</th></tr>
                </thead>
                <tbody>
                  <tr><td>PostHog Inc.</td><td>Analytics (consent-based)</td><td>EU (Frankfurt, Germany)</td></tr>
                  <tr><td>Railway, Inc.</td><td>Hosting</td><td>US (SCCs in place)</td></tr>
                  <tr><td>n8n GmbH</td><td>Email notification routing</td><td>EU</td></tr>
                </tbody>
              </table>
              <p>We do not sell your personal data. We do not share it with third parties for marketing purposes.</p>
            </Section>

            <Section title="5. Data retention">
              <ul>
                <li><strong>Contact form submissions:</strong> kept for 2 years from receipt, then deleted.</li>
                <li><strong>Analytics data:</strong> events retained for 1 year in PostHog (our configured project retention period).</li>
                <li><strong>Server logs:</strong> up to 7 days (hosting provider).</li>
              </ul>
            </Section>

            <Section title="6. International transfers">
              <p>Railway, Inc. is based in the United States. We rely on EU Standard Contractual Clauses (SCCs) to lawfully transfer data. All analytics data is processed and stored within the EU (PostHog EU Cloud).</p>
            </Section>

            <Section title="7. Your rights (AVG / GDPR)">
              <p>Under the General Data Protection Regulation (GDPR) and the Dutch Uitvoeringswet AVG, you have the following rights:</p>
              <ul>
                <li><strong>Right of access</strong> — request a copy of the personal data we hold about you</li>
                <li><strong>Right to rectification</strong> — request correction of inaccurate data</li>
                <li><strong>Right to erasure</strong> — request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Right to restriction</strong> — request we limit how we use your data</li>
                <li><strong>Right to data portability</strong> — request your data in a machine-readable format</li>
                <li><strong>Right to object</strong> — object to processing based on legitimate interest</li>
                <li><strong>Right to withdraw consent</strong> — withdraw analytics consent at any time via cookie settings</li>
              </ul>
              <p>To exercise any of these rights, email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We will respond within 30 days. There is no charge for reasonable requests.</p>
              <p>You also have the right to lodge a complaint with the Dutch supervisory authority:</p>
              <p><strong>{DPA_AUTHORITY}</strong><br />
                Website: <a href={DPA_URL} target="_blank" rel="noopener noreferrer">{DPA_URL}</a>
              </p>
            </Section>

            <Section title="8. Security">
              <p>We implement appropriate technical and organisational measures to protect your personal data, including TLS encryption in transit, access controls, and regular security reviews. Our staff access to personal data is limited to those with a legitimate need.</p>
            </Section>

            <Section title="9. Children">
              <p>Our services are not directed at children under 16. We do not knowingly collect personal data from children. If you believe a child has submitted data to us, please contact us and we will delete it promptly.</p>
            </Section>

            <Section title="10. Changes to this policy">
              <p>We may update this policy from time to time. We will post the revised policy on this page with an updated &quot;Last updated&quot; date. We encourage you to review it periodically.</p>
            </Section>

            <Section title="11. Contact">
              <p>Questions or concerns about this policy? Please contact:<br />
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
                {COMPANY}<br />
                {ADDRESS}
              </p>
            </Section>
          </Prose>

          <div className="mt-12 pt-8 border-t flex gap-6 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            <Link href="/cookies" className="hover:text-[var(--text)] transition-colors" style={{ color: 'var(--teal)' }}>Cookie Policy →</Link>
            <Link href="/" className="hover:text-[var(--text)] transition-colors">← Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ color: 'var(--body)' } as React.CSSProperties}
      className="[&_p]:text-[15px] [&_p]:leading-[1.75] [&_a]:text-[var(--teal)] [&_a]:underline [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:text-[15px] [&_ul]:leading-[1.75] [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_table]:w-full [&_table]:text-[13px] [&_table]:border-collapse [&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:border [&_th]:font-semibold [&_td]:py-2 [&_td]:px-3 [&_td]:border"
    >
      <style>{`table { border-color: var(--border); } th, td { border-color: var(--border) !important; }`}</style>
      {children}
    </div>
  )
}
