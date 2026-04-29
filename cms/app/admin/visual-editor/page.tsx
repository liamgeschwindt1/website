'use client'

import { useState, useRef, useEffect, useCallback, DragEvent } from 'react'

type DeviceMode = 'desktop' | 'mobile'
type RightTab = 'edit' | 'ai' | 'structure'

interface SelectedElement {
  xpath: string
  tagName: string
  text: string | null
  src: string | null
  alt: string | null
  component: string
}

interface Section {
  xpath: string
  name: string
}

interface DiffProposal {
  before: string
  after: string
  reply: string
  filePath: string
}

// Each undo snapshot records the live edit state at a point in time
interface UndoSnapshot {
  editText: string
  editAlt: string
  iframeKey: number
  pendingStyle: { xpath: string; text: string; tagName: string; style: Record<string, string> } | null
}

const SITE_PAGES = [
  { label: 'Home', path: '/' },
  { label: 'For Business', path: '/for-business' },
  { label: 'Tiera', path: '/tiera' },
  { label: 'Partners', path: '/partners' },
]

const PAGE_FILE_MAP: Record<string, string> = {
  '/': 'app/page.tsx',
  '/for-business': 'app/for-business/page.tsx',
  '/tiera': 'app/tiera/page.tsx',
  '/partners': 'app/partners/page.tsx',
}

const DEVICE_WIDTHS: Record<DeviceMode, number> = { desktop: 1280, mobile: 390 }

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://touchpulse-production.up.railway.app'

// ─── Floating mini-widget (issue + media) ────────────────────────────────────

function MiniWidget() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'issue' | 'media'>('issue')
  const [issueTitle, setIssueTitle] = useState('')
  const [issueBody, setIssueBody] = useState('')
  const [issueSending, setIssueSending] = useState(false)
  const [issueDone, setIssueDone] = useState(false)
  const [issueError, setIssueError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const click = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', h)
    document.addEventListener('mousedown', click)
    return () => { window.removeEventListener('keydown', h); document.removeEventListener('mousedown', click) }
  }, [open])

  async function submitIssue() {
    if (!issueTitle.trim()) return
    setIssueSending(true)
    setIssueError('')
    try {
      const res = await fetch('/api/github/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: issueTitle, body: issueBody, label: 'cms' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setIssueDone(true)
      setIssueTitle('')
      setIssueBody('')
      setTimeout(() => { setIssueDone(false); setOpen(false) }, 2000)
    } catch (e: unknown) {
      setIssueError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setIssueSending(false)
    }
  }

  async function uploadFile(file: File) {
    setUploading(true)
    setUploadMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      await navigator.clipboard.writeText(data.url).catch(() => {})
      setUploadMsg(`✓ Uploaded — URL copied`)
    } catch (e: unknown) {
      setUploadMsg(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  return (
    <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 50 }}>
      {open && (
        <div
          ref={panelRef}
          className="rounded-[14px] border shadow-2xl"
          style={{
            width: 320,
            background: 'rgba(3,12,19,0.98)',
            borderColor: 'var(--border)',
            position: 'absolute',
            bottom: 60,
            right: 0,
          }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
            {(['issue', 'media'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 py-3 text-[12px] font-medium transition-colors"
                style={{ color: tab === t ? 'var(--teal)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--teal)' : '2px solid transparent' }}
              >
                {t === 'issue' ? 'Report Issue' : 'Upload Media'}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'issue' ? (
              issueDone ? (
                <p className="text-[13px] text-center py-4" style={{ color: 'var(--teal)' }}>✓ Issue created on GitHub</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    value={issueTitle}
                    onChange={e => setIssueTitle(e.target.value)}
                    placeholder="Issue title"
                    className="px-3 py-2 rounded-[7px] border text-[13px]"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <textarea
                    value={issueBody}
                    onChange={e => setIssueBody(e.target.value)}
                    placeholder="Description (optional)"
                    rows={3}
                    className="px-3 py-2 rounded-[7px] border text-[13px] resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  {issueError && <p className="text-[12px]" style={{ color: '#f87171' }}>{issueError}</p>}
                  <button
                    type="button"
                    onClick={submitIssue}
                    disabled={issueSending || !issueTitle.trim()}
                    className="px-4 py-2 rounded-[7px] text-[13px] font-medium disabled:opacity-50"
                    style={{ background: 'var(--teal)', color: '#031119' }}
                  >
                    {issueSending ? 'Sending…' : 'Create GitHub issue'}
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                <div
                  className="rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center py-8 gap-2 text-[13px] cursor-pointer transition-all"
                  style={{
                    borderColor: dragging ? 'var(--teal)' : 'rgba(255,255,255,0.15)',
                    background: dragging ? 'rgba(1,180,175,0.06)' : 'transparent',
                    color: dragging ? 'var(--teal)' : 'var(--muted)',
                  }}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? 'Uploading…' : 'Drop file or click to upload'}
                </div>
                <input ref={fileRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                {uploadMsg && <p className="text-[12px]" style={{ color: uploadMsg.startsWith('✓') ? 'var(--teal)' : '#f87171' }}>{uploadMsg}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        style={{ background: 'var(--teal)' }}
        title="Dev tools"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#031119" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
      </button>
    </div>
  )
}

// ─── Main Visual Editor ───────────────────────────────────────────────────────

export default function VisualEditorPage() {
  const [activePage, setActivePage] = useState('/')
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [tab, setTab] = useState<RightTab>('edit')
  const [selected, setSelected] = useState<SelectedElement | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [iframeKey, setIframeKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Edit tab state
  const [editText, setEditText] = useState('')
  const [editAlt, setEditAlt] = useState('')
  const [applying, setApplying] = useState(false)
  const [pushingPR, setPushingPR] = useState(false)
  const [editMsg, setEditMsg] = useState('')

  // Pending style change from drag/resize
  const [pendingStyle, setPendingStyle] = useState<{ xpath: string; text: string; tagName: string; style: Record<string, string> } | null>(null)
  const [pushingStyle, setPushingStyle] = useState(false)

  // Undo stack — push a snapshot before each live edit
  const undoStack = useRef<UndoSnapshot[]>([])
  const MAX_UNDO = 40

  function pushUndo() {
    const snap: UndoSnapshot = { editText, editAlt, iframeKey, pendingStyle }
    undoStack.current = [...undoStack.current.slice(-MAX_UNDO + 1), snap]
  }

  function undo() {
    const prev = undoStack.current.pop()
    if (!prev) return
    setEditText(prev.editText)
    setEditAlt(prev.editAlt)
    setPendingStyle(prev.pendingStyle)
    if (prev.iframeKey !== iframeKey) setIframeKey(prev.iframeKey)
    // Revert live preview text
    if (selected) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'cms:update', xpath: selected.xpath, property: 'text', value: prev.editText },
        '*'
      )
    }
  }

  // AI tab state
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [proposal, setProposal] = useState<DiffProposal | null>(null)
  const [aiError, setAiError] = useState('')
  const [aiPushing, setAiPushing] = useState(false)

  // Structure tab drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)

  const iframeSrc = `${siteUrl}${activePage}${activePage.includes('?') ? '&' : '?'}cms=true`

  // Listen for postMessage from iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'cms:select') {
        const el = e.data as SelectedElement & { type: string }
        setSelected(el)
        setEditText(el.text ?? '')
        setEditAlt(el.alt ?? '')
        setTab('edit')
      } else if (e.data?.type === 'cms:structure') {
        setSections(e.data.sections ?? [])
      } else if (e.data?.type === 'cms:styleChange') {
        setPendingStyle({
          xpath: e.data.xpath,
          text: e.data.text ?? '',
          tagName: e.data.tagName,
          style: e.data.style,
        })
        setTab('edit')
        setEditMsg('Style change captured — push to production when ready.')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  function sendUpdate(property: string, value: string) {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'cms:update', xpath: selected?.xpath, property, value },
      '*'
    )
  }

  function handleTextChange(val: string) {
    pushUndo()
    setEditText(val)
    sendUpdate('text', val)
  }

  async function applyToFile() {
    if (!selected || !selected.text) return
    setApplying(true)
    setEditMsg('')
    try {
      const filePath = PAGE_FILE_MAP[activePage] ?? 'app/page.tsx'
      const fileRes = await fetch(`/api/website-manager/file?path=${encodeURIComponent(filePath)}`)
      if (!fileRes.ok) {
        const errData = await fileRes.json().catch(() => ({} as Record<string, string>)) as Record<string, string>
        throw new Error(errData.error ?? 'Could not read file')
      }
      const { content } = await fileRes.json() as { content: string }
      const oldText = selected.text
      if (!content.includes(oldText)) throw new Error('Original text not found in source — use Push to PR instead')
      const newContent = content.replace(oldText, editText)
      const writeRes = await fetch('/api/website-manager/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: newContent }),
      })
      if (!writeRes.ok) throw new Error('Saved file (local write may not persist in production — use Push to PR)')
      setEditMsg('✓ Saved to workspace')
      setIframeKey(k => k + 1)
    } catch (e: unknown) {
      setEditMsg(e instanceof Error ? e.message : 'Apply failed')
    } finally {
      setApplying(false)
    }
  }

  async function pushToPR() {
    if (!selected) return
    setPushingPR(true)
    setEditMsg('')
    try {
      const filePath = PAGE_FILE_MAP[activePage] ?? 'app/page.tsx'
      const fileRes = await fetch(`/api/website-manager/file?path=${encodeURIComponent(filePath)}`)
      if (!fileRes.ok) {
        const errData = await fileRes.json().catch(() => ({} as Record<string, string>)) as Record<string, string>
        throw new Error(errData.error ?? 'Could not read file')
      }
      const { content } = await fileRes.json() as { content: string }
      const oldText = selected.text ?? ''
      if (oldText && !content.includes(oldText)) throw new Error('Original text not found in source file')
      const newContent = oldText ? content.replace(oldText, editText) : content
      const res = await fetch('/api/github/website-manager/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `CMS text edit: ${filePath}`,
          body: `**Changed in** \`${filePath}\`\n\n> ${oldText.slice(0, 120)} → ${editText.slice(0, 120)}`,
          files: [{ path: `touchpulse/${filePath}`, content: newContent }],
        }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'PR failed')
      if (data.url) window.open(data.url, '_blank')
      setEditMsg('✓ PR created')
    } catch (e: unknown) {
      setEditMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setPushingPR(false)
    }
  }

  async function pushStyleToPR() {
    if (!pendingStyle) return
    setPushingStyle(true)
    setEditMsg('')
    try {
      const filePath = PAGE_FILE_MAP[activePage] ?? 'app/page.tsx'
      const fileRes = await fetch(`/api/website-manager/file?path=${encodeURIComponent(filePath)}`)
      if (!fileRes.ok) throw new Error('Could not read file')
      const { content } = await fileRes.json() as { content: string }
      const styleStr = Object.entries(pendingStyle.style).map(([k, v]) => `${k}: '${v}'`).join(', ')
      const prompt = `Add the following inline style to the \`${pendingStyle.tagName}\` element that contains the text "${pendingStyle.text.slice(0, 100)}": style={{ ${styleStr} }}. If the element already has a style prop, merge these values into it. Change only that one element.`
      const aiRes = await fetch('/api/website-manager/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, filePath, content }),
      })
      const aiData = await aiRes.json() as { proposedContent?: string; reply?: string; error?: string }
      if (!aiRes.ok) throw new Error(aiData.error ?? 'AI request failed')
      if (!aiData.proposedContent) throw new Error(aiData.reply ?? 'AI could not apply the change')
      const res = await fetch('/api/github/website-manager/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `CMS style: ${pendingStyle.tagName} in ${filePath}`,
          body: `**Style applied:** \`{ ${styleStr} }\``,
          files: [{ path: `touchpulse/${filePath}`, content: aiData.proposedContent }],
        }),
      })
      const prData = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(prData.error ?? 'PR failed')
      if (prData.url) window.open(prData.url, '_blank')
      setEditMsg('✓ Style PR created')
      setPendingStyle(null)
      setIframeKey(k => k + 1)
    } catch (e: unknown) {
      setEditMsg(e instanceof Error ? e.message : 'Style push failed')
    } finally {
      setPushingStyle(false)
    }
  }

  function replaceInJson(obj: unknown, oldVal: string, newVal: string): unknown {
    if (typeof obj === 'string') return obj === oldVal ? newVal : obj
    if (Array.isArray(obj)) return obj.map(i => replaceInJson(i, oldVal, newVal))
    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, replaceInJson(v, oldVal, newVal)])
      )
    }
    return obj
  }

  async function sendAI() {
    if (!aiInput.trim()) return
    setAiLoading(true)
    setAiError('')
    setProposal(null)
    try {
      const filePath = PAGE_FILE_MAP[activePage] ?? 'app/page.tsx'
      const fileRes = await fetch(`/api/website-manager/file?path=${encodeURIComponent(filePath)}`)
      const fileData = fileRes.ok ? (await fileRes.json() as { content: string }) : { content: '' }
      const res = await fetch('/api/website-manager/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiInput, filePath, content: fileData.content }),
      })
      const data = await res.json() as { reply?: string; proposedContent?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'AI request failed')
      if (data.proposedContent) {
        setProposal({ before: fileData.content, after: data.proposedContent, reply: data.reply ?? '', filePath })
      } else {
        setAiError(data.reply ?? 'No proposal generated.')
      }
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'AI request failed')
    } finally {
      setAiLoading(false)
    }
  }

  async function applyAndPush() {
    if (!proposal) return
    setAiPushing(true)
    try {
      await fetch('/api/website-manager/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: proposal.filePath, content: proposal.after }),
      })
      const res = await fetch('/api/github/website-manager/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Visual Editor AI: ${aiInput.slice(0, 60)}`,
          body: `**Prompt:** ${aiInput}`,
          files: [{ path: `touchpulse/${proposal.filePath}`, content: proposal.after }],
        }),
      })
      const data = await res.json() as { url?: string }
      if (data.url) window.open(data.url, '_blank')
      setProposal(null)
      setAiInput('')
      setIframeKey(k => k + 1)
    } finally {
      setAiPushing(false)
    }
  }

  // Structure drag-to-reorder
  const moveSections = useCallback(() => {
    if (dragIdx === null || dropIdx === null || dragIdx === dropIdx) return
    setSections(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(dropIdx, 0, moved)
      return next
    })
    setDragIdx(null)
    setDropIdx(null)
  }, [dragIdx, dropIdx])

  const iframeWidth = DEVICE_WIDTHS[device]
  const isText = selected && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'li', 'button', 'label'].includes(selected.tagName)
  const isImg = selected?.tagName === 'img'
  const isVideo = selected?.tagName === 'video'
  const isContainer = selected && ['section', 'div', 'main', 'article', 'header', 'footer'].includes(selected.tagName)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh)', overflow: 'hidden', position: 'relative' }}>

      {/* Left panel — iframe */}
      <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
        {/* Toolbar */}
        <div
          className="flex items-center gap-4 px-4 flex-shrink-0"
          style={{ height: 48, background: 'rgba(1,180,175,0.08)', borderBottom: '1px solid var(--border)' }}
        >
          <select
            value={activePage}
            onChange={e => { setActivePage(e.target.value); setIframeKey(k => k + 1); setSelected(null) }}
            className="px-3 py-1.5 rounded-[6px] border text-[12px] font-medium"
            style={{ background: 'rgba(3,12,19,0.8)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {SITE_PAGES.map(p => <option key={p.path} value={p.path}>{p.label}</option>)}
          </select>

          <div className="flex rounded-[6px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            {(['desktop', 'mobile'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className="px-3 py-1 text-[11px] font-medium transition-colors"
                style={device === d
                  ? { background: 'var(--teal)', color: '#031119' }
                  : { background: 'rgba(3,12,19,0.7)', color: 'var(--muted)' }}
              >
                {d === 'desktop' ? '⬜ Desktop' : '📱 Mobile'}
              </button>
            ))}
          </div>

          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{iframeWidth}px</span>
        </div>

        {/* iframe wrapper */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#fff', position: 'relative' }}>
          <div style={{
            width: iframeWidth,
            height: '100%',
            margin: device === 'mobile' ? '0 auto' : '0',
            transition: 'width 0.3s',
            position: 'relative',
          }}>
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={iframeSrc}
              title="Site preview"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      </div>

      {/* Right panel — editing controls */}
      <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Tabs */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          {(['edit', 'ai', 'structure'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-[12px] font-semibold uppercase tracking-wide transition-colors"
              style={{
                color: tab === t ? 'var(--teal)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid var(--teal)' : '2px solid transparent',
              }}
            >
              {t === 'edit' ? 'Edit' : t === 'ai' ? 'AI' : 'Structure'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* ── Edit tab ─────────────────────────────────────────────────── */}
          {tab === 'edit' && (
            <div className="flex flex-col gap-4">
              {!selected ? (
                <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
                  <p className="text-[13px]">Click any element in the preview to select it.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-[8px] px-3 py-2 text-[12px]" style={{ background: 'rgba(1,180,175,0.08)', color: 'var(--teal)' }}>
                    Selected: <strong>{selected.component || selected.tagName}</strong>
                  </div>

                  {isText && (
                    <div>
                      <label className="text-[11px] uppercase tracking-wide font-medium block mb-1" style={{ color: 'var(--muted)' }}>Text content</label>
                      <textarea
                        value={editText}
                        onChange={e => handleTextChange(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-[7px] border text-[13px] resize-none"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                  )}

                  {isImg && (
                    <div className="flex flex-col gap-3">
                      {selected.src && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selected.src} alt={selected.alt ?? ''} className="rounded-[8px] border max-h-32 object-contain" style={{ borderColor: 'var(--border)' }} />
                      )}
                      <div>
                        <label className="text-[11px] uppercase tracking-wide font-medium block mb-1" style={{ color: 'var(--muted)' }}>Alt text</label>
                        <input
                          value={editAlt}
                          onChange={e => { setEditAlt(e.target.value); sendUpdate('alt', e.target.value) }}
                          className="w-full px-3 py-2 rounded-[7px] border text-[13px]"
                          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        />
                      </div>
                    </div>
                  )}

                  {isVideo && (
                    <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Video element selected. Use the Code Editor to replace the source file.</p>
                  )}

                  {isContainer && (
                    <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Container selected ({selected.tagName}). Use the AI tab to describe layout changes.</p>
                  )}

                  <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                      type="button"
                      onClick={undo}
                      disabled={undoStack.current.length === 0}
                      title="Undo last change"
                      className="px-3 py-2 rounded-[7px] text-[12px] border disabled:opacity-30"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
                    >
                      ↩ Undo
                    </button>
                    <button
                      type="button"
                      onClick={applyToFile}
                      disabled={applying}
                      className="flex-1 px-3 py-2 rounded-[7px] text-[12px] font-medium border disabled:opacity-50"
                      style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
                    >
                      {applying ? 'Saving…' : 'Save to workspace'}
                    </button>
                    <button
                      type="button"
                      onClick={pushToPR}
                      disabled={pushingPR || !selected?.text}
                      className="flex-1 px-3 py-2 rounded-[7px] text-[12px] font-medium disabled:opacity-50"
                      style={{ background: 'var(--teal)', color: '#031119' }}
                    >
                      {pushingPR ? 'Creating PR…' : 'Push text to PR'}
                    </button>
                  </div>

                  {/* Pending style from drag/resize */}
                  {pendingStyle && (
                    <div className="rounded-[8px] p-3 flex flex-col gap-2" style={{ background: 'rgba(255,177,0,0.08)', border: '1px solid rgba(255,177,0,0.3)' }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>Pending style change</p>
                      <p className="text-[12px] font-mono" style={{ color: 'var(--body)' }}>
                        {Object.entries(pendingStyle.style).map(([k, v]) => `${k}: ${v}`).join('; ')}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        on &lt;{pendingStyle.tagName}&gt; — applies via AI + PR
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={pushStyleToPR}
                          disabled={pushingStyle}
                          className="flex-1 px-3 py-2 rounded-[7px] text-[12px] font-medium disabled:opacity-50"
                          style={{ background: 'var(--gold)', color: '#031119' }}
                        >
                          {pushingStyle ? 'Pushing…' : 'Push style to production ↗'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPendingStyle(null); setIframeKey(k => k + 1) }}
                          className="px-3 py-2 rounded-[7px] text-[12px] border"
                          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  )}

                  {editMsg && <p className="text-[12px]" style={{ color: editMsg.startsWith('✓') ? 'var(--teal)' : editMsg.includes('captured') ? 'var(--gold)' : '#f87171' }}>{editMsg}</p>}
                </>
              )}
            </div>
          )}

          {/* ── AI tab ───────────────────────────────────────────────────── */}
          {tab === 'ai' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wide font-medium block mb-1" style={{ color: 'var(--muted)' }}>Describe a change</label>
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={`e.g. "Change the hero headline to say Welcome to Touchpulse"`}
                  rows={4}
                  className="w-full px-3 py-2 rounded-[7px] border text-[13px] resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendAI() }}
                />
              </div>
              <button
                type="button"
                onClick={sendAI}
                disabled={aiLoading || !aiInput.trim()}
                className="px-4 py-2 rounded-[7px] text-[13px] font-medium disabled:opacity-50"
                style={{ background: 'var(--teal)', color: '#031119' }}
              >
                {aiLoading ? 'Thinking…' : 'Generate proposal'}
              </button>

              {aiError && <p className="text-[13px]" style={{ color: '#f87171' }}>{aiError}</p>}

              {proposal && (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px]" style={{ color: 'var(--text)' }}>{proposal.reply}</p>
                  <div className="rounded-[8px] border overflow-hidden text-[11px] font-mono" style={{ borderColor: 'var(--border)' }}>
                    <div className="px-3 py-2" style={{ background: 'rgba(248,113,113,0.07)', borderBottom: '1px solid var(--border)', color: '#f87171' }}>
                      <p className="text-[10px] font-sans uppercase tracking-wide mb-1 font-medium" style={{ color: '#f87171' }}>Before</p>
                      <pre className="whitespace-pre-wrap break-all text-[10px] max-h-32 overflow-y-auto">{proposal.before.slice(0, 800)}{proposal.before.length > 800 ? '…' : ''}</pre>
                    </div>
                    <div className="px-3 py-2" style={{ background: 'rgba(74,222,128,0.07)', color: '#4ade80' }}>
                      <p className="text-[10px] font-sans uppercase tracking-wide mb-1 font-medium" style={{ color: '#4ade80' }}>After</p>
                      <pre className="whitespace-pre-wrap break-all text-[10px] max-h-32 overflow-y-auto">{proposal.after.slice(0, 800)}{proposal.after.length > 800 ? '…' : ''}</pre>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProposal(null)}
                      className="flex-1 px-3 py-2 rounded-[7px] text-[12px] font-medium border"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={applyAndPush}
                      disabled={aiPushing}
                      className="flex-1 px-3 py-2 rounded-[7px] text-[12px] font-medium disabled:opacity-50"
                      style={{ background: 'var(--teal)', color: '#031119' }}
                    >
                      {aiPushing ? 'Creating PR…' : 'Apply + Push PR'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Structure tab ─────────────────────────────────────────────── */}
          {tab === 'structure' && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] mb-2" style={{ color: 'var(--muted)' }}>
                Drag to reorder page sections. Fires an AI prompt on drop.
              </p>
              {sections.length === 0 ? (
                <p className="text-[13px] text-center py-8" style={{ color: 'var(--muted)' }}>
                  No sections detected yet. Load the page first.
                </p>
              ) : (
                sections.map((sec, idx) => (
                  <div
                    key={sec.xpath}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={e => { e.preventDefault(); setDropIdx(idx) }}
                    onDrop={moveSections}
                    onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] border cursor-grab transition-all"
                    style={{
                      borderColor: dropIdx === idx ? 'var(--teal)' : 'var(--border)',
                      background: dragIdx === idx ? 'rgba(1,180,175,0.08)' : 'rgba(255,255,255,0.03)',
                      color: 'var(--text)',
                    }}
                  >
                    <span style={{ color: 'var(--muted)' }}>⠿</span>
                    <span className="text-[13px] flex-1">{sec.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>#{idx + 1}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Floating mini-widget */}
        <MiniWidget />
      </div>
    </div>
  )
}
