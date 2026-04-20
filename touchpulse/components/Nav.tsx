'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[clamp(24px,5vw,80px)] h-[60px] transition-all duration-200 ${
        scrolled
          ? 'bg-[rgba(3,17,25,0.88)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.08)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <Link
        href="/"
        className="text-[18px] font-medium text-[var(--text)] no-underline tracking-[-0.01em]"
        aria-label="TouchPulse home"
      >
        TouchPulse
      </Link>

      <ul className="flex items-center gap-7 list-none" role="list">
        <li>
          <Link href="/" className="text-[14px] text-[var(--teal)] no-underline">
            Home
          </Link>
        </li>
        <li>
          <Link
            href="#usecases"
            className="text-[14px] text-[rgba(247,247,247,0.50)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            For Business
          </Link>
        </li>
        <li>
          <Link
            href="#ai"
            className="text-[14px] text-[rgba(247,247,247,0.50)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            Tiera
          </Link>
        </li>
        <li>
          <Link
            href="#partners"
            className="text-[14px] text-[rgba(247,247,247,0.50)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            Partners
          </Link>
        </li>
        <li>
          <Link
            href="#"
            className="text-[14px] text-[rgba(247,247,247,0.50)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            Blog
          </Link>
        </li>
      </ul>

      <Link
        href="#contact"
        className="min-h-[44px] min-w-[44px] flex items-center px-4 py-2 border border-[rgba(255,255,255,0.6)] rounded-[6px] text-[13px] font-medium text-[var(--text)] no-underline hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150"
      >
        Book demo ↗
      </Link>
    </nav>
  )
}
