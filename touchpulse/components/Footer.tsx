import Link from 'next/link'

const productLinks = [
  { label: 'Tiera app', href: '#ai' },
  { label: 'For retail', href: '#usecases' },
  { label: 'For transport', href: '#usecases' },
  { label: 'For hospital', href: '#usecases' },
  { label: 'For university', href: '#' },
]

const companyLinks = [
  { label: 'Team', href: '#' },
  { label: 'Partners', href: '#partners' },
  { label: 'Blog', href: '#' },
  { label: 'Contact', href: '#contact' },
]

const legalLinks = [
  { label: 'Privacy policy', href: '#' },
  { label: 'Terms of service', href: '#' },
  { label: 'Accessibility', href: '#' },
]

export default function Footer() {
  return (
    <footer className="px-[clamp(24px,5vw,80px)] pt-16 pb-10 border-t border-[var(--border)]">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
        {/* Brand */}
        <div>
          <div className="text-[17px] font-medium text-[var(--text)]">TouchPulse</div>
          <p
            className="text-[14px] text-[var(--muted)] mt-2 leading-[1.6] max-w-[240px]"
            style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
          >
            Navigation intelligence for a more accessible, independent world.
          </p>
          <address className="not-italic text-[13px] text-[var(--muted)] mt-4 leading-[1.7]">
            Het Eeuwsel 57, 5612 AS<br />
            Eindhoven, Netherlands<br />
            <br />
            <a href="mailto:info@touchpulse.nl" className="hover:text-[var(--text)] transition-colors duration-150">
              info@touchpulse.nl
            </a>
          </address>
        </div>

        {/* Product */}
        <nav aria-label="Product links">
          <h4 className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Product
          </h4>
          <ul className="flex flex-col gap-[10px] list-none" role="list">
            {productLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[14px] text-[rgba(247,247,247,0.45)] no-underline hover:text-[var(--text)] transition-colors duration-150"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label="Company links">
          <h4 className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Company
          </h4>
          <ul className="flex flex-col gap-[10px] list-none" role="list">
            {companyLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[14px] text-[rgba(247,247,247,0.45)] no-underline hover:text-[var(--text)] transition-colors duration-150"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal links">
          <h4 className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Legal
          </h4>
          <ul className="flex flex-col gap-[10px] list-none" role="list">
            {legalLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[14px] text-[rgba(247,247,247,0.45)] no-underline hover:text-[var(--text)] transition-colors duration-150"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-[var(--border)] pt-6">
        <p className="text-[13px] text-[var(--muted)]">
          &copy; 2026 TouchPulse B.V. (kvk 98689371) &mdash; Built by{' '}
          <a
            href="https://studio.touchpulse.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--teal)] hover:opacity-80 transition-opacity duration-150 no-underline"
          >
            O&amp;M Studio
          </a>
        </p>
        <nav aria-label="Social links" className="flex gap-5">
          {['Instagram', 'LinkedIn', 'Facebook'].map((social) => (
            <a
              key={social}
              href="#"
              aria-label={`TouchPulse on ${social}`}
              className="text-[13px] text-[var(--muted)] no-underline hover:text-[var(--text)] transition-colors duration-150"
            >
              {social}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
