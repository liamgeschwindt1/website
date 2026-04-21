'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useRef, RefObject, ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

let initialized = false
let fullInitialized = false

// Init anonymously (memory-only, no cookies, GDPR-safe) — fires for everyone
function initAnonymous() {
  if (initialized || !POSTHOG_KEY || typeof window === 'undefined') return
  initialized = true
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false, // manual only for anon
    persistence: 'memory', // no cookies, no localStorage — fully cookieless
    loaded: ph => {
      if (process.env.NODE_ENV === 'development') ph.debug()
    },
  })
}

// Upgrade to full tracking after consent
export function initPostHog() {
  if (fullInitialized || !POSTHOG_KEY || typeof window === 'undefined') return
  fullInitialized = true
  if (!initialized) {
    initialized = true
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      persistence: 'localStorage+cookie',
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]',
      },
      loaded: ph => {
        if (process.env.NODE_ENV === 'development') ph.debug()
      },
    })
  } else {
    // Already init'd in memory mode — upgrade persistence
    posthog.set_config({
      persistence: 'localStorage+cookie',
      autocapture: true,
    })
  }
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Always init anonymously (memory-only, no cookies)
    initAnonymous()
    // Upgrade if consent already given
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('tp_cookie_consent')
      if (consent === 'all') initPostHog()
    }
  }, [])

  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href })
  }, [pathname, searchParams])

  if (!POSTHOG_KEY) return <>{children}</>
  return <PHProvider client={posthog}>{children}</PHProvider>
}

// ─── Scroll depth tracking ───────────────────────────────────────────────────
export function useScrollDepth() {
  const fired = useRef(new Set<number>())

  useEffect(() => {
    if (typeof window === 'undefined') return
    fired.current.clear()

    const milestones = [25, 50, 75, 90, 100]

    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      const pct = Math.round((scrolled / total) * 100)
      for (const m of milestones) {
        if (pct >= m && !fired.current.has(m)) {
          fired.current.add(m)
          if (posthog.__loaded) {
            posthog.capture('scroll_depth', {
              depth_pct: m,
              page: window.location.pathname,
            })
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}

// ─── Section view tracking ────────────────────────────────────────────────────
export function useSectionView(ref: RefObject<HTMLElement | null>, sectionName: string) {
  const fired = useRef(false)

  useEffect(() => {
    fired.current = false
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true
          if (posthog.__loaded) {
            posthog.capture('section_view', {
              section: sectionName,
              page: window.location.pathname,
            })
          }
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, sectionName])
}

// ─── Named events ─────────────────────────────────────────────────────────────
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
