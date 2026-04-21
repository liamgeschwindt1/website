'use client'

import { useState, useEffect } from 'react'
import { initPostHog } from '@/lib/posthog'
import Link from 'next/link'

type ConsentLevel = 'all' | 'necessary' | null

const STORAGE_KEY = 'tp_cookie_consent'

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentLevel>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentLevel | null
    if (stored === 'all' || stored === 'necessary') {
      setConsent(stored)
      if (stored === 'all') initPostHog()
    }
  }, [])

  return consent
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [customising, setCustomising] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  function accept(level: 'all' | 'necessary') {
    localStorage.setItem(STORAGE_KEY, level)
    if (level === 'all') initPostHog()
    setVisible(false)
  }

  function saveCustom() {
    accept(analyticsOn ? 'all' : 'necessary')
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-[440px] z-[9999] rounded-[14px] border shadow-2xl"
      style={{ background: 'rgba(3,18,30,0.97)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}
    >
      <div className="p-5">
        {!customising ? (
          <>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-[20px] flex-shrink-0">🍪</span>
              <div>
                <p className="text-[14px] font-semibold mb-1" style={{ color: '#f7f7f7' }}>
                  We use cookies
                </p>
                <p className="text-[12px] leading-[1.65]" style={{ color: 'rgba(247,247,247,0.55)' }}>
                  We use analytics cookies to understand how you use our site and improve your experience. We never sell data. See our{' '}
                  <Link href="/privacy" className="underline" style={{ color: '#01b4af' }}>privacy policy</Link>
                  {' '}and{' '}
                  <Link href="/cookies" className="underline" style={{ color: '#01b4af' }}>cookie policy</Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => accept('all')}
                className="flex-1 py-2 rounded-[8px] text-[13px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#01b4af', color: '#031119' }}
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => accept('necessary')}
                className="flex-1 py-2 rounded-[8px] text-[13px] font-medium border transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(247,247,247,0.7)', background: 'transparent' }}
              >
                Necessary only
              </button>
              <button
                type="button"
                onClick={() => setCustomising(true)}
                className="px-3 py-2 rounded-[8px] text-[13px] border transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(247,247,247,0.5)', background: 'transparent' }}
                aria-label="Customise cookie settings"
              >
                ⚙
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold mb-4" style={{ color: '#f7f7f7' }}>Customise cookies</p>

            {/* Strictly necessary */}
            <div className="flex items-start justify-between gap-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#f7f7f7' }}>Strictly necessary</p>
                <p className="text-[11px] mt-0.5 leading-[1.5]" style={{ color: 'rgba(247,247,247,0.45)' }}>
                  Required for the site to function. Cannot be disabled.
                </p>
              </div>
              <div className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: 'rgba(1,180,175,0.2)', color: '#01b4af' }}>
                Always on
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#f7f7f7' }}>Analytics</p>
                <p className="text-[11px] mt-0.5 leading-[1.5]" style={{ color: 'rgba(247,247,247,0.45)' }}>
                  Helps us understand how visitors use our site (PostHog, EU servers, GDPR-compliant). Includes page views, session recordings, and interaction events. No cross-site tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsOn(a => !a)}
                className="flex-shrink-0 w-10 h-[22px] rounded-full relative transition-colors"
                style={{ background: analyticsOn ? '#01b4af' : 'rgba(255,255,255,0.15)' }}
                aria-pressed={analyticsOn}
                aria-label="Toggle analytics cookies"
              >
                <span
                  className="absolute top-[3px] w-4 h-4 rounded-full transition-all"
                  style={{ background: '#fff', left: analyticsOn ? '22px' : '3px' }}
                />
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={saveCustom}
                className="flex-1 py-2 rounded-[8px] text-[13px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#01b4af', color: '#031119' }}
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={() => setCustomising(false)}
                className="px-4 py-2 rounded-[8px] text-[13px] border"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(247,247,247,0.5)', background: 'transparent' }}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
