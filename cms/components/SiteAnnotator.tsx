'use client'

import { useState, useRef, useEffect } from 'react'

interface Annotation {
  x: number
  y: number
  xpath: string
  label: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://touchpulse-production.up.railway.app'

const PAGES = [
  { label: 'Home', path: '/' },
  { label: 'Get Involved', path: '/#get-involved' },
  { label: 'Pricing', path: '/#pricing' },
  { label: 'AI Section', path: '/#ai' },
  { label: 'Use Cases', path: '/#usecases' },
]

const TYPES = ['bug', 'feature-request', 'content', 'design', 'copy', 'question', 'urgent']

export default function SiteAnnotator() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [annotation, setAnnotation] = useState<Annotation | null>(null)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [label, setLabel] = useState('content')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [clickMode, setClickMode] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Listen for click messages from the annotator script injected via postMessage
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'ANNOTATION_CLICK') {
        setAnnotation({ x: e.data.x, y: e.data.y, xpath: e.data.xpath, label: e.data.label })
        setClickMode(false)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Inject the click capture script into the iframe when click mode is enabled
  useEffect(() => {
    if (!clickMode) return
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const script = doc.createElement('script')
      script.id = '__annotator__'
      script.textContent = `
        (function() {
          if (window.__annotatorActive) return;
          window.__annotatorActive = true;
          document.body.style.cursor = 'crosshair';
          function getXPath(el) {
            if (!el || el.nodeType !== 1) return '';
            if (el.id) return '//*[@id="' + el.id + '"]';
            const parts = [];
            while (el && el.nodeType === 1) {
              let idx = 1;
              let sib = el.previousSibling;
              while (sib) { if (sib.nodeType === 1 && sib.tagName === el.tagName) idx++; sib = sib.previousSibling; }
              parts.unshift(el.tagName.toLowerCase() + (idx > 1 ? '[' + idx + ']' : ''));
              el = el.parentElement;
            }
            return '/' + parts.join('/');
          }
          function onClick(e) {
            e.preventDefault(); e.stopPropagation();
            const rect = document.documentElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / document.documentElement.scrollWidth * 100).toFixed(1);
            const y = ((e.clientY + window.scrollY) / document.documentElement.scrollHeight * 100).toFixed(1);
            const label = e.target.textContent?.trim().slice(0, 60) || e.target.tagName;
            window.parent.postMessage({ type: 'ANNOTATION_CLICK', x: parseFloat(x), y: parseFloat(y), xpath: getXPath(e.target), label }, '*');
            document.body.style.cursor = '';
            window.__annotatorActive = false;
            document.removeEventListener('click', onClick, true);
          }
          document.addEventListener('click', onClick, true);
        })();
      `
      doc.body.appendChild(script)
    } catch {
      // Cross-origin — can't inject script. Show message.
    }
  }, [clickMode])

  async function handleSubmit() {
    if (!title.trim()) return
    setStatus('loading')
    try {
      const body = [
        details,
        '',
        '---',
        `**Page:** ${SITE_URL}${currentPath}`,
        annotation ? `**Element:** ${annotation.label}` : '',
        annotation ? `**XPath:** \`${annotation.xpath}\`` : '',
        annotation ? `**Position:** ${annotation.x}% from left, ${annotation.y}% from top` : '',
      ].filter(Boolean).join('\n')

      const res = await fetch('/api/github/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, label }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setAnnotation(null)
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
            Click anywhere on the site preview to pin a request to that element.
          </p>
        </div>

        {/* Page selector */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] uppercase tracking-wide font-medium mb-3" style={{ color: 'var(--muted)' }}>Page</p>
          <div className="flex flex-col gap-1">
            {PAGES.map(p => (
              <button
                key={p.path}
                type="button"
                onClick={() => { setCurrentPath(p.path); setAnnotation(null) }}
                className="text-left px-3 py-1.5 rounded-[6px] text-[13px] transition-colors duration-150"
                style={currentPath === p.path
                  ? { background: 'rgba(1,180,175,0.12)', color: 'var(--teal)' }
                  : { color: 'var(--muted)' }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Click to annotate */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => { setClickMode(true); setAnnotation(null) }}
            className="w-full py-2.5 rounded-[7px] text-[13px] font-medium border transition-all duration-150"
            style={clickMode
              ? { background: 'rgba(1,180,175,0.15)', borderColor: 'var(--teal)', color: 'var(--teal)' }
              : { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }
            }
          >
            {clickMode ? '🎯 Click an element…' : '+ Click to select element'}
          </button>
          {annotation && (
            <div className="mt-3 p-3 rounded-[7px] border text-[11px]" style={{ borderColor: 'rgba(1,180,175,0.3)', background: 'rgba(1,180,175,0.06)', color: 'var(--teal)' }}>
              ✓ Element selected: <span className="font-medium">{annotation.label}</span>
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
              rows={4}
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

      {/* iframe preview */}
      <div className="flex-1 relative overflow-hidden" ref={overlayRef}>
        {clickMode && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-start justify-center pt-4">
            <div className="px-4 py-2 rounded-full text-[12px] font-medium shadow-lg" style={{ background: 'var(--teal)', color: '#031119' }}>
              🎯 Click any element on the page
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={`${SITE_URL}${currentPath}`}
          className="w-full h-full border-0"
          title="Site preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
