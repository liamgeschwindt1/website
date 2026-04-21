'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ColorScheme = 'dark' | 'contrast-dark' | 'contrast-light' | 'sepia'

interface AccessibilityContextValue {
  accessibilityMode: boolean
  toggleAccessibilityMode: () => void
  colorScheme: ColorScheme
  setColorScheme: (s: ColorScheme) => void
  fontSize: number
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  accessibilityMode: false,
  toggleAccessibilityMode: () => {},
  colorScheme: 'dark',
  setColorScheme: () => {},
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
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark')
  const [fontSize, setFontSize] = useState(100)

  // Persist preferences
  useEffect(() => {
    const stored = localStorage.getItem('tp-a11y')
    if (stored) {
      try {
        const { mode, size, scheme } = JSON.parse(stored)
        if (mode) setAccessibilityMode(true)
        if (size) setFontSize(size)
        if (scheme) setColorSchemeState(scheme)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tp-a11y', JSON.stringify({ mode: accessibilityMode, size: fontSize, scheme: colorScheme }))
  }, [accessibilityMode, fontSize, colorScheme])

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
    const html = document.documentElement
    (['dark', 'contrast-dark', 'contrast-light', 'sepia'] as ColorScheme[]).forEach(s => {
      html.classList.remove(`a11y-scheme-${s}`)
    })
    if (accessibilityMode) {
      html.classList.add(`a11y-scheme-${colorScheme}`)
    }
  }, [accessibilityMode, colorScheme])

  useEffect(() => {
    document.documentElement.style.setProperty('--a11y-font-scale', `${fontSize / 100}`)
  }, [fontSize])

  const toggleAccessibilityMode = useCallback(() => {
    setAccessibilityMode(prev => {
      if (prev) setFontSize(100) // reset size when turning off
      return !prev
    })
  }, [])

  const setColorScheme = useCallback((s: ColorScheme) => setColorSchemeState(s), [])

  const increaseFontSize = useCallback(() => setFontSize(s => Math.min(s + FONT_STEP, FONT_MAX)), [])
  const decreaseFontSize = useCallback(() => setFontSize(s => Math.max(s - FONT_STEP, FONT_MIN)), [])
  const resetFontSize = useCallback(() => setFontSize(100), [])

  return (
    <AccessibilityContext.Provider value={{ accessibilityMode, toggleAccessibilityMode, colorScheme, setColorScheme, fontSize, increaseFontSize, decreaseFontSize, resetFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  )
}
