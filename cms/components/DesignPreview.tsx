'use client'

import { useMemo, useState, useRef } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://touchpulse-production.up.railway.app'

const PAGES = [
  { label: 'Home', path: '/' },
  { label: 'Home - Get Involved', path: '/#get-involved' },
  { label: 'Home - Pricing', path: '/#pricing' },
  { label: 'Home - AI Section', path: '/#ai' },
  { label: 'Home - Use Cases', path: '/#usecases' },
  { label: 'For Business', path: '/for-business' },
  { label: 'Tiera', path: '/tiera' },
  { label: 'Partners', path: '/partners' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Cookies', path: '/cookies' },
]

export default function DesignPreview() {
  const [currentPath, setCurrentPath] = useState('/')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const previewUrl = useMemo(() => `${SITE_URL}${currentPath}`, [currentPath])

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(true)
      })
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false)
      })
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div ref={containerRef} className="h-[calc(100vh-56px)] flex flex-col gap-0 relative">
      {/* Control bar — fixed at top of preview */}
      <div className="absolute top-4 left-4 right-4 z-50 flex flex-wrap items-center gap-3 bg-[rgba(3,12,19,0.92)] border border-[var(--border)] rounded-[10px] p-3 backdrop-blur-[12px]">
        <select
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          className="px-3 py-1.5 rounded-[6px] text-[12px] border min-w-[200px]"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          {PAGES.map((option) => (
            <option key={option.path} value={option.path} style={{ background: '#031119' }}>{option.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="ml-auto px-3 py-1.5 rounded-[6px] text-[12px] font-medium border transition-all"
          style={{ background: 'rgba(1,180,175,0.15)', color: 'var(--teal)', borderColor: 'var(--teal)' }}
          title="Toggle fullscreen"
        >
          {isFullscreen ? '⊟ Exit' : '⊞ Fullscreen'}
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <iframe
          src={previewUrl}
          title="TouchPulse website preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
