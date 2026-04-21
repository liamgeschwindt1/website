'use client'

import { useState, FormEvent } from 'react'
import { createGithubIssue, toggleButtonStyle } from '@/lib/utils'

const LABELS = ['bug', 'feature-request', 'content', 'question', 'urgent']
type Target = 'suite' | 'frontend'

export default function GithubWidget() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [label, setLabel] = useState('feature-request')
  const [target, setTarget] = useState<Target>('suite')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setStatus('loading')
    setErrorMsg('')
    const locationLine = location.trim() ? `\n**Location:** ${location.trim()}` : ''
    const fullBody = `**Target:** ${target === 'suite' ? '🟦 Suite (CMS)' : '🌐 Frontend (Site)'}${locationLine}\n\n${body}`
    try {
      await createGithubIssue({ title, body: fullBody, label })
      setStatus('success')
      setTitle('')
      setBody('')
      setLabel('feature-request')
      setLocation('')
      setTimeout(() => { setStatus('idle'); setOpen(false) }, 2500)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create issue')
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-[6px] text-[13px] border transition-colors duration-150 focus:outline-none focus:border-[var(--teal)]'
  const inputStyle = { background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => { setOpen(true); setStatus('idle') }}
        aria-label="Send request to developers"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-[13px] font-medium transition-all duration-200 hover:scale-105"
        style={{ background: 'var(--teal)', color: '#031119' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        Request to devs
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-[360px] rounded-[14px] border shadow-[0_8px_48px_rgba(0,0,0,0.7)] overflow-hidden"
          style={{ background: 'rgba(5,18,28,0.98)', borderColor: 'rgba(255,255,255,0.12)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Send to developers</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>Creates a GitHub issue in the repo</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[20px] leading-none transition-colors duration-150"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {status === 'success' ? (
            <div className="px-5 py-10 text-center">
              <div className="text-3xl mb-3">✓</div>
              <p className="text-[14px] font-medium" style={{ color: 'var(--teal)' }}>Issue created!</p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>The dev team has been notified.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              {/* Target */}
              <div>
                <label className="block text-[11px] font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  For
                </label>
                <div className="flex gap-2">
                  {([['suite', '🟦 Suite (CMS)'], ['frontend', '🌐 Frontend (Site)']] as [Target, string][]).map(([t, lbl]) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTarget(t)}
                      className="flex-1 py-1.5 rounded-[6px] text-[12px] font-medium border transition-all"
                      style={toggleButtonStyle(target === t)}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              {target === 'frontend' && (
                <div>
                  <label className="block text-[11px] font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                    Page / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Home → Hero, /for-business pricing table"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-[11px] font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className="px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-150"
                      style={toggleButtonStyle(label === l)}
                    >
                      {l.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Title <span aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the request"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-[11px] font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Details
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe what you need or what's broken…"
                  rows={4}
                  className={inputClass}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {status === 'error' && (
                <p className="text-[12px]" style={{ color: '#f87171' }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !title.trim()}
                className="w-full py-2.5 rounded-[6px] text-[13px] font-medium transition-opacity duration-150 disabled:opacity-50"
                style={{ background: 'var(--teal)', color: '#031119' }}
              >
                {status === 'loading' ? 'Creating issue…' : 'Create GitHub issue ↗'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
