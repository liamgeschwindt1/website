'use client'

import { useMemo, useState } from 'react'

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
  const previewUrl = useMemo(() => `${SITE_URL}${currentPath}`, [currentPath])

  return (
    <div className="px-8 py-8 h-[calc(100vh-56px)] flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Design Preview</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
            The website preview is back here so you can inspect pages while sending requests with the floating widget.
          </p>
        </div>
        <select
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          className="ml-auto px-3 py-2 rounded-[7px] text-[13px] border min-w-[240px]"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          {PAGES.map((option) => (
            <option key={option.path} value={option.path} style={{ background: '#031119' }}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 rounded-[14px] border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'rgba(3,12,19,0.7)' }}>
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
