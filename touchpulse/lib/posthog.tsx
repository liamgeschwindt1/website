'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

let initialized = false

export function initPostHog() {
  if (initialized || !POSTHOG_KEY || typeof window === 'undefined') return
  initialized = true
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // we do it manually to track SPA navigation
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: true, // mask email/name fields for GDPR
      maskTextSelector: '[data-ph-mask]',
    },
    loaded: ph => {
      if (process.env.NODE_ENV === 'development') ph.debug()
    },
  })
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize on mount if consent was already given in a previous visit
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('tp_cookie_consent')
      if (consent === 'all') initPostHog()
    }
  }, [])

  useEffect(() => {
    // Page view tracking — wait for posthog to be ready
    if (typeof window === 'undefined') return
    const url = window.location.href
    if (posthog.__loaded) {
      posthog.capture('$pageview', { $current_url: url })
    } else {
      // posthog may still be initialising; wait for loaded callback
      const interval = setInterval(() => {
        if (posthog.__loaded) {
          clearInterval(interval)
          posthog.capture('$pageview', { $current_url: url })
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [pathname, searchParams])

  if (!POSTHOG_KEY) return <>{children}</>

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// Call these from anywhere after user interaction
export const track = {
  ctaClick: (label: string, location: string) =>
    posthog.__loaded && posthog.capture('cta_click', { label, location }),

  formStart: (formName: string) =>
    posthog.__loaded && posthog.capture('form_start', { form: formName }),

  formSubmit: (formName: string, success: boolean) =>
    posthog.__loaded && posthog.capture('form_submit', { form: formName, success }),

  sectionView: (section: string) =>
    posthog.__loaded && posthog.capture('section_view', { section }),

  linkClick: (label: string, href: string) =>
    posthog.__loaded && posthog.capture('link_click', { label, href }),
}
