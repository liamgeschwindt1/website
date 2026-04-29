'use client'

import { useEffect, useRef, ReactNode } from 'react'

/**
 * Wraps children with the .reveal class. When the element scrolls
 * into view the .visible modifier is added, triggering the brand
 * fade-up animation. Respects prefers-reduced-motion automatically
 * via CSS in globals.css.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'article'
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => el.classList.add('visible'), delay)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])

  // @ts-expect-error - Tag is a valid intrinsic element
  return <Tag ref={ref} className={`reveal ${className}`}>{children}</Tag>
}
