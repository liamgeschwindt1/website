import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="px-[clamp(24px,5vw,80px)] pt-16 pb-10 border-t border-[var(--border)]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {/* Product */}
        <nav aria-label="Product links">
          <h4 className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Product
          </h4>
          <ul className="flex flex-col gap-[10px] list-none" role="list">
            {[
              { label: 'Tiera', href: '/tiera' },
              { label: 'For Business', href: '/for-business' },
              { label: 'Partners', href: '/partners' },
            ].map(l => (
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

        {/* Professionals */}
        <nav aria-label="Professionals links">
          <h4 className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Professionals
          </h4>
          <ul className="flex flex-col gap-[10px] list-none" role="list">
            <li>
              <a
                href="https://studio.touchpulse.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[rgba(247,247,247,0.45)] no-underline hover:text-[var(--text)] transition-colors duration-150"
              >
                O&amp;M Studio ↗
              </a>
            </li>
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label="Company links">
          <h4 className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Company
          </h4>
          <ul className="flex flex-col gap-[10px] list-none" role="list">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Cookies', href: '/cookies' },
            ].map(l => (
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

        {/* Contact */}
        <div>
          <h4 className="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--muted)] mb-4">
            Contact
          </h4>
          <a
            href="mailto:info@touchpulse.nl"
            className="text-[14px] text-[rgba(247,247,247,0.45)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            info@touchpulse.nl
          </a>
        </div>
      </div>

      {/* Legal row */}
      <div className="border-t border-[var(--border)] pt-6">
        <p className="text-[13px] text-[var(--muted)]">
          TouchPulse B.V. &middot; Amsterdam &middot; 2026
        </p>
      </div>
    </footer>
  )
}

