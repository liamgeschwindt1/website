'use client'

import { useState, useRef } from 'react'
import { createGithubIssue } from '@/lib/utils'

interface Pin {
  x: number  // percent of iframe width
  y: number  // percent of iframe height
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://touchpulse-production.up.railway.app'

const PAGES = [
  { label: 'Home', path: '/' },
  { label: 'Home — Get Involved', path: '/#get-involved' },
  { label: 'Home — Pricing', path: '/#pricing' },
  { label: 'Home — AI Section', path: '/#ai' },
  { label: 'Home — Use Cases', path: '/#usecases' },
  { label: 'For Business', path: '/for-business' },
  { label: 'Tiera', path: '/tiera' },
  { label: 'Partners', path: '/partners' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Cookies', path: '/cookies' },
]

const TYPES = ['bug', 'feature-request', 'content', 'design', 'copy', 'question', 'urgent']

export default function SiteAnnotator() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [pin, setPin] = useState<Pin | null>(null)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [label, setLabel] = useState('content')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [clickMode, setClickMode] = useState(false)

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!clickMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1))
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1))
    setPin({ x, y })
    setClickMode(false)

    const pageName = PAGES.find(p => p.path === currentPath)?.label ?? currentPath
    const locationBlock = `**Location:** ${x}% from left, ${y}% from top (${pageName})`
    setDetails(prev => {
      const marker = '**Location:**'
      const idx = prev.indexOf(marker)
      if (idx !== -1) {
        const before = prev.slice(0, idx).trimEnd()
        return before + (before ? '\n\n' : '') + locationBlock
      }
      return prev.trim() ? prev.trimEnd() + '\n\n' + locationBlock : locationBlock
    })
  }

  async function handleSubmit() {
    if (!title.trim()) return
    setStatus('loading')
    try {
      const body = [
        details,
        '',
        '---',
        `**Target:** 🌐 Frontend (Site)`,
        `**Page:** ${SITE_URL}${currentPath}`,
        pin ? `**Pin:** ${pin.x}% from left, ${pin.y}% from top` : '',
      ].filter(Boolean).join('\n')

      await createGithubIssue({ title, body, label })
      setStatus('success')
      setPin(null)
      setTitle('')
      setDetails('')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left sidebar */}
      <div className="w-[280px] flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--border)', background: 'rgba(3,12,19,0.95)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Site Annotator</h2>
          <p className="text-[12px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
            Click &ldquo;Pin a location&rdquo; then click anywhere on the preview. The position is added to the issue automatically.
          </p>
        </div>

        {/* Page selector */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] uppercase tracking-wide font-medium mb-3" style={{ color: 'var(--muted)' }}>Page</p>
          <select
            value={currentPath}
            onChange={e => { setCurrentPath(e.target.value); setPin(null) }}
            className="w-full px-3 py-2 rounded-[6px] text-[13px] border focus:outline-none focus:border-[var(--teal)] transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {PAGES.map(p => (
              <option key={p.path} value={p.path} style={{ background: '#031119' }}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Pin button */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setClickMode(c => !c)}
            className="w-full py-2.5 rounded-[7px] text-[13px] font-medium border transition-all duration-150"
            style={clickMode
              ? { background: 'rgba(1,180,175,0.15)', borderColor: 'var(--teal)', color: 'var(--teal)' }
              : { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }
            }
          >
            {clickMode ? '🎯 Click the preview…' : '+ Pin a location'}
          </button>
          {pin && (
            <div className="mt-3 p-3 rounded-[7px] border text-[11px] flex items-center justify-between" style={{ borderColor: 'rgba(1,180,175,0.3)', background: 'rgba(1,180,175,0.06)', color: 'var(--teal)' }}>
              <span>✓ Pinned at {pin.x}%, {pin.y}%</span>
              <button type="button" className="opacity-60 hover:opacity-100 ml-2" onClick={() => setPin(null)}>✕</button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-medium mb-2" style={{ color: 'var(--muted)' }}>Type</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => setLabel(t)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150"
                  style={label === t
                    ? { background: 'rgba(1,180,175,0.15)', borderColor: 'var(--teal)', color: 'var(--teal)' }
                    : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted)' }
                  }
                >
                  {t.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide font-medium mb-2" style={{ color: 'var(--muted)' }}>Title *</p>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Brief summary…"
              className="w-full px-3 py-2 rounded-[6px] text-[13px] border focus:outline-none focus:border-[var(--teal)] transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide font-medium mb-2" style={{ color: 'var(--muted)' }}>Details</p>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="What needs to change and why…"
              rows={5}
              className="w-full px-3 py-2 rounded-[6px] text-[13px] border focus:outline-none focus:border-[var(--teal)] transition-colors resize-y"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          {status === 'success' && (
            <div className="p-3 rounded-[7px] text-[12px] text-center" style={{ background: 'rgba(1,180,175,0.1)', color: 'var(--teal)', border: '1px solid rgba(1,180,175,0.3)' }}>
              ✓ Issue created! Dev team notified.
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 rounded-[7px] text-[12px]" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
              Failed. Check GITHUB_TOKEN in settings.
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || status === 'loading'}
            className="w-full py-2.5 rounded-[7px] text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            {status === 'loading' ? 'Creating…' : 'Create GitHub issue ↗'}
          </button>
        </div>
      </div>

      {/* iframe + overlay */}
      <div className="flex-1 relative overflow-hidden">
        {/* Transparent overlay — captures clicks in clickMode, shows pin */}
        <div
          onClick={handleOverlayClick}
          className="absolute inset-0 z-20"
          style={{ cursor: clickMode ? 'crosshair' : 'default', pointerEvents: clickMode || pin ? 'all' : 'none' }}
        >
          {clickMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[12px] font-medium shadow-lg pointer-events-none" style={{ background: 'var(--teal)', color: '#031119' }}>
              🎯 Click anywhere to pin a location
            </div>
          )}
          {pin && (
            <div
              className="absolute pointer-events-none"
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Pulse ring */}
              <div className="absolute rounded-full" style={{
                width: 36, height: 36,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(1,180,175,0.12)',
                border: '1.5px solid rgba(1,180,175,0.45)',
                animation: 'pin-pulse 2s ease-in-out infinite',
              }} />
              {/* Dot */}
              <div className="relative rounded-full" style={{
                width: 14, height: 14,
                background: 'var(--teal)',
                border: '2.5px solid #fff',
                boxShadow: '0 0 0 2px rgba(1,180,175,0.5), 0 2px 10px rgba(0,0,0,0.5)',
              }} />
              {/* Label */}
              <div className="absolute text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full" style={{
                bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(3,12,19,0.92)',
                color: 'var(--teal)',
                border: '1px solid rgba(1,180,175,0.3)',
              }}>
                {pin.x}%, {pin.y}%
              </div>
            </div>
          )}
        </div>

        <iframe
          ref={iframeRef}
          src={`${SITE_URL}${currentPath}`}
          className="w-full h-full border-0"
          title="Site preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <style>{`
        @keyframes pin-pulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%,-50%) scale(1.6); opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}
