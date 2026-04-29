'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAccessibility, type ColorScheme } from './AccessibilityProvider'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [a11yPanelOpen, setA11yPanelOpen] = useState(false)
  const { accessibilityMode, toggleAccessibilityMode, colorScheme, setColorScheme, fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!a11yPanelOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-a11y-panel]')) setA11yPanelOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [a11yPanelOpen])

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[clamp(24px,5vw,80px)] h-[60px] transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(3,17,25,0.92)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.08)] shadow-[0_1px_40px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <Link
        href="/"
        className="flex items-center no-underline"
        aria-label="TouchPulse home"
      >
        <Image
          src="/touchpulse-logo.png"
          alt="TouchPulse"
          width={140}
          height={36}
          priority
          className="h-[30px] w-auto object-contain"
        />
      </Link>

      <ul className="flex items-center gap-7 list-none" role="list">
        {/* Accessibility mode toggle — first interactive item */}
        <li className="relative" data-a11y-panel>
          <button
            type="button"
            onClick={() => setA11yPanelOpen(p => !p)}
            aria-expanded={a11yPanelOpen}
            aria-label="Accessibility options"
            title="Accessibility options"
            className={`flex items-center gap-1.5 text-[13px] font-medium px-3 py-1 rounded-full border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[var(--teal)] ${
              accessibilityMode
                ? 'border-[var(--teal)] text-[var(--teal)] bg-[rgba(1,180,175,0.12)]'
                : 'border-[rgba(255,255,255,0.25)] text-[rgba(247,247,247,0.65)] hover:border-[rgba(1,180,175,0.45)] hover:text-[var(--teal)]'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v5M9 10l-2 5M15 10l2 5M9 14l3 3 3-3"/>
            </svg>
            <span className="hidden sm:inline">Accessibility</span>
            {accessibilityMode && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] inline-block" aria-hidden="true" />
            )}
          </button>

          {/* Dropdown panel */}
          {a11yPanelOpen && (
            <div
              data-a11y-panel
              role="dialog"
              aria-label="Accessibility settings"
              className="absolute top-[calc(100%+10px)] left-0 z-50 w-72 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(3,17,25,0.97)] backdrop-blur-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--text)] uppercase tracking-widest">Accessibility</span>
                <button
                  type="button"
                  onClick={() => setA11yPanelOpen(false)}
                  aria-label="Close accessibility panel"
                  className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Main toggle */}
              <label className="flex items-center justify-between cursor-pointer gap-3">
                <div>
                  <p className="text-[14px] font-medium text-[var(--text)]">Accessibility Mode</p>
                  <p className="text-[12px] text-[var(--muted)] mt-0.5">Large text, simplified layout, high contrast</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={accessibilityMode}
                  onClick={toggleAccessibilityMode}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--teal)] ${
                    accessibilityMode ? 'bg-[var(--teal)]' : 'bg-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      accessibilityMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>

              {/* Font size controls — only visible in a11y mode */}
              {accessibilityMode && (
                <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 flex flex-col gap-3">
                  <p className="text-[13px] font-medium text-[var(--text)]">Text Size — {fontSize}%</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={decreaseFontSize}
                      disabled={fontSize <= 100}
                      aria-label="Decrease text size"
                      className="flex-1 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[var(--text)] text-[13px] font-bold disabled:opacity-30 hover:enabled:border-[var(--teal)] hover:enabled:text-[var(--teal)] transition-colors"
                    >
                      A−
                    </button>
                    <button
                      type="button"
                      onClick={resetFontSize}
                      aria-label="Reset text size"
                      className="flex-1 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[var(--muted)] text-[12px] hover:border-[rgba(255,255,255,0.3)] hover:text-[var(--text)] transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={increaseFontSize}
                      disabled={fontSize >= 160}
                      aria-label="Increase text size"
                      className="flex-1 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[var(--text)] text-[20px] font-bold disabled:opacity-30 hover:enabled:border-[var(--teal)] hover:enabled:text-[var(--teal)] transition-colors"
                    >
                      A+
                    </button>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={160}
                    step={10}
                    value={fontSize}
                    onChange={e => {
                      const v = Number(e.target.value)
                      if (v > fontSize) increaseFontSize()
                      else if (v < fontSize) decreaseFontSize()
                    }}
                    aria-label="Text size slider"
                    className="w-full accent-[var(--teal)] cursor-pointer"
                  />
                  <p className="text-[11px] text-[var(--muted)]">
                    Tip: text size resets when you turn off accessibility mode.
                  </p>
                  {/* Color scheme */}
                  <div className="border-t border-[rgba(255,255,255,0.08)] pt-3 mt-1">
                    <p className="text-[12px] font-medium text-[var(--text)] mb-2">Colour Scheme</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        ['dark', 'Dark Teal', '#071520', '#01B4AF'],
                        ['contrast-dark', 'High Contrast', '#000', '#ffff00'],
                        ['contrast-light', 'Light', '#fff', '#000'],
                        ['sepia', 'Warm Sepia', '#f5e6c8', '#2c1a08'],
                      ] as [ColorScheme, string, string, string][]).map(([s, label, bg, fg]) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setColorScheme(s)}
                          aria-pressed={colorScheme === s}
                          className="flex items-center gap-2 px-2 py-2 rounded-lg border text-[11px] font-medium transition-all"
                          style={colorScheme === s
                            ? { borderColor: 'var(--teal)', color: 'var(--teal)', background: 'rgba(1,180,175,0.1)' }
                            : { borderColor: 'rgba(255,255,255,0.12)', color: 'var(--muted)', background: 'transparent' }
                          }
                        >
                          <span
                            className="w-5 h-5 rounded-full border flex-shrink-0"
                            style={{ background: bg, borderColor: fg }}
                            aria-hidden="true"
                          />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </li>
        <li>
          <Link href="/" className="text-[14px] text-[var(--teal)] no-underline">
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/for-business"
            className="text-[14px] text-[rgba(247,247,247,0.50)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            For Business
          </Link>
        </li>
        <li>
          <Link
            href="/tiera"
            className="text-[14px] text-[rgba(247,247,247,0.50)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            Tiera
          </Link>
        </li>
        <li>
          <Link
            href="/partners"
            className="text-[14px] text-[rgba(247,247,247,0.50)] no-underline hover:text-[var(--text)] transition-colors duration-150"
          >
            Partners
          </Link>
        </li>
      </ul>

      <a
        href="mailto:info@touchpulse.nl?subject=Demo%20request"
        className="min-h-[44px] min-w-[44px] flex items-center px-4 py-2 border border-[rgba(255,255,255,0.6)] rounded-[6px] text-[13px] font-medium text-[var(--text)] no-underline hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-150"
      >
        Book a demo ↗
      </a>
    </nav>
  )
}
