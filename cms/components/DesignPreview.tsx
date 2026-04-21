'use client'

import { useMemo, useRef, useState } from 'react'

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

type Pin = { x: number; y: number } | null

function sectionFromPath(path: string) {
  const [route, hash] = path.split('#')
  if (hash) return hash
  if (route === '/for-business') return 'for-business'
  if (route === '/tiera') return 'tiera'
  if (route === '/partners') return 'partners'
  if (route === '/privacy') return 'privacy'
  if (route === '/cookies') return 'cookies'
  return 'home'
}

export default function DesignPreview() {
  const [currentPath, setCurrentPath] = useState('/')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [navOpen, setNavOpen] = useState(true)
  const [clickMode, setClickMode] = useState(false)
  const [pin, setPin] = useState<Pin>(null)
  const [requestTitle, setRequestTitle] = useState('')
  const [requestDetails, setRequestDetails] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const previewUrl = useMemo(() => `${SITE_URL}${currentPath}`, [currentPath])

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().catch(() => setIsFullscreen(false))
    }
    setIsFullscreen((prev) => !prev)
  }

  function emitPrefill() {
    const detail = {
      target: 'frontend',
      pagePath: currentPath.startsWith('/') ? currentPath.split('#')[0] : '/',
      location: sectionFromPath(currentPath),
      pinX: pin ? String(pin.x) : '',
      pinY: pin ? String(pin.y) : '',
      title: requestTitle,
      body: requestDetails,
    }
    window.dispatchEvent(new CustomEvent('tp-prefill-dev-request', { detail }))
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!clickMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1))
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1))
    const nextPin = { x, y }
    setPin(nextPin)
    setClickMode(false)

    window.dispatchEvent(
      new CustomEvent('tp-prefill-dev-request', {
        detail: {
          target: 'frontend',
          pagePath: currentPath.startsWith('/') ? currentPath.split('#')[0] : '/',
          location: sectionFromPath(currentPath),
          pinX: String(x),
          pinY: String(y),
          title: requestTitle,
          body: requestDetails,
        },
      }),
    )
  }

  return (
    <div ref={containerRef} className="h-[calc(100vh-56px)] relative overflow-hidden" style={{ background: '#020b11' }}>
      <button
        type="button"
        onClick={() => setNavOpen((prev) => !prev)}
        className="absolute top-4 left-4 z-50 px-3 py-2 rounded-[8px] text-[12px] font-medium border"
        style={{ background: 'rgba(3,12,19,0.9)', color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.35)' }}
      >
        {navOpen ? 'Hide navigator' : 'Show navigator'}
      </button>

      {navOpen && (
        <aside
          className="absolute top-16 left-4 bottom-4 z-40 w-[280px] rounded-[12px] border p-4 overflow-y-auto"
          style={{ background: 'rgba(3,12,19,0.92)', borderColor: 'var(--border)', backdropFilter: 'blur(8px)' }}
        >
          <p className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--muted)' }}>Page</p>
          <select
            value={currentPath}
            onChange={(e) => {
              setCurrentPath(e.target.value)
              setPin(null)
            }}
            className="w-full px-3 py-2 rounded-[7px] text-[12px] border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {PAGES.map((option) => (
              <option key={option.path} value={option.path} style={{ background: '#031119' }}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setClickMode((prev) => !prev)}
              className="flex-1 px-3 py-2 rounded-[7px] text-[12px] font-medium border"
              style={
                clickMode
                  ? { background: 'rgba(1,180,175,0.15)', color: 'var(--teal)', borderColor: 'var(--teal)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'var(--text)', borderColor: 'var(--border)' }
              }
            >
              {clickMode ? 'Click on preview…' : 'Tag location'}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-2 rounded-[7px] text-[12px] font-medium border"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>

          {pin && (
            <div className="mt-3 px-3 py-2 rounded-[7px] text-[12px] border" style={{ borderColor: 'rgba(1,180,175,0.35)', color: 'var(--teal)', background: 'rgba(1,180,175,0.08)' }}>
              Tagged: {pin.x}% / {pin.y}%
            </div>
          )}

          <div className="mt-4">
            <label className="block text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--muted)' }}>Issue title</label>
            <input
              value={requestTitle}
              onChange={(e) => setRequestTitle(e.target.value)}
              placeholder="Describe the frontend change"
              className="w-full px-3 py-2 rounded-[7px] text-[12px] border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div className="mt-3">
            <label className="block text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--muted)' }}>Change details</label>
            <textarea
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              rows={6}
              placeholder="Write exact copy/design changes for devs"
              className="w-full px-3 py-2 rounded-[7px] text-[12px] border resize-y"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--body)' }}
            />
          </div>

          <button
            type="button"
            onClick={emitPrefill}
            className="w-full mt-3 px-3 py-2 rounded-[7px] text-[12px] font-medium"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            Send to dev (prefill widget)
          </button>
        </aside>
      )}

      <div className="absolute inset-0">
        <iframe
          src={previewUrl}
          title="TouchPulse website preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div
        onClick={handleOverlayClick}
        className="absolute inset-0 z-30"
        style={{ pointerEvents: clickMode || pin ? 'auto' : 'none', cursor: clickMode ? 'crosshair' : 'default' }}
      >
        {clickMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[12px] font-medium"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            Click anywhere on the page preview to tag the issue location
          </div>
        )}

        {pin && (
          <div
            className="absolute pointer-events-none"
            style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative rounded-full" style={{ width: 14, height: 14, background: 'var(--teal)', border: '2px solid #fff' }} />
          </div>
        )}
      </div>
    </div>
  )
}
