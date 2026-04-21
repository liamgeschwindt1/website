'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface AccessibilityContextValue {
  accessibilityMode: boolean
  toggleAccessibilityMode: () => void
  fontSize: number
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  accessibilityMode: false,
  toggleAccessibilityMode: () => {},
  fontSize: 100,
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  resetFontSize: () => {},
})

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

const FONT_STEP = 10
const FONT_MIN = 100
const FONT_MAX = 160

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  const [fontSize, setFontSize] = useState(100)

  // Persist preferences
  useEffect(() => {
    const stored = localStorage.getItem('tp-a11y')
    if (stored) {
      try {
        const { mode, size } = JSON.parse(stored)
        if (mode) setAccessibilityMode(true)
        if (size) setFontSize(size)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tp-a11y', JSON.stringify({ mode: accessibilityMode, size: fontSize }))
  }, [accessibilityMode, fontSize])

  // Apply classes / CSS vars to <html>
  useEffect(() => {
    const html = document.documentElement
    if (accessibilityMode) {
      html.classList.add('a11y-mode')
    } else {
      html.classList.remove('a11y-mode')
    }
  }, [accessibilityMode])

  useEffect(() => {
    document.documentElement.style.setProperty('--a11y-font-scale', `${fontSize / 100}`)
  }, [fontSize])

  const toggleAccessibilityMode = useCallback(() => {
    setAccessibilityMode(prev => {
      if (prev) setFontSize(100) // reset size when turning off
      return !prev
    })
  }, [])

  const increaseFontSize = useCallback(() => setFontSize(s => Math.min(s + FONT_STEP, FONT_MAX)), [])
  const decreaseFontSize = useCallback(() => setFontSize(s => Math.max(s - FONT_STEP, FONT_MIN)), [])
  const resetFontSize = useCallback(() => setFontSize(100), [])

  return (
    <AccessibilityContext.Provider value={{ accessibilityMode, toggleAccessibilityMode, fontSize, increaseFontSize, decreaseFontSize, resetFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  )
}
