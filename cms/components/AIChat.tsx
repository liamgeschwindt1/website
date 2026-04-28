'use client'

import { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChangeProposal {
  type: 'website_copy' | 'page' | 'post' | 'footer'
  id?: string
  title: string
  description: string
  after: unknown
}

interface UploadedMedia {
  id: string
  url: string
  mimeType: string
  filename: string
}

interface Attachment {
  url: string
  mimeType: string
  filename: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: Attachment[]
  changes?: ChangeProposal[]
  uploadedMedia?: UploadedMedia[]
}

// ─── Change preview helper ────────────────────────────────────────────────────

function ChangePreview({ change }: { change: ChangeProposal }) {
  if (change.type === 'footer') {
    const text = typeof change.after === 'string' ? change.after : JSON.stringify(change.after, null, 2)
    return (
      <pre
        className="text-xs rounded p-2 overflow-auto max-h-40 mt-2"
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--muted)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
        }}
      >
        {text.slice(0, 600)}
        {text.length > 600 ? '\n...' : ''}
      </pre>
    )
  }

  if (change.type === 'website_copy') {
    const obj = change.after as Record<string, unknown>
    return (
      <div className="mt-2 space-y-2">
        {Object.entries(obj).map(([section, val]) => (
          <div key={section}>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5" style={{ color: 'var(--muted)' }}>
              {section}
            </p>
            <pre
              className="text-xs rounded p-1.5 overflow-auto max-h-28"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--muted)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(val as Record<string, unknown>, null, 2).slice(0, 300)}
            </pre>
          </div>
        ))}
      </div>
    )
  }

  // page or post
  const obj = change.after as Record<string, unknown>
  return (
    <div className="mt-2 space-y-1.5 text-xs">
      {!!obj.title && (
        <div>
          <span style={{ color: 'var(--muted)' }}>Title: </span>
          <span style={{ color: 'var(--text)' }}>{String(obj.title)}</span>
        </div>
      )}
      {!!obj.excerpt && (
        <div>
          <span style={{ color: 'var(--muted)' }}>Excerpt: </span>
          <span style={{ color: 'var(--text)' }}>{String(obj.excerpt).slice(0, 150)}</span>
        </div>
      )}
      {!!obj.content && (
        <div>
          <p style={{ color: 'var(--muted)' }}>Content:</p>
          <pre
            className="rounded p-1.5 overflow-auto max-h-36 mt-0.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--muted)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: 11,
            }}
          >
            {String(obj.content).slice(0, 500)}
            {String(obj.content).length > 500 ? '\n...' : ''}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Change card ──────────────────────────────────────────────────────────────

interface ChangeCardProps {
  change: ChangeProposal
  cKey: string
  isApplied: boolean
  isApplying: boolean
  disableApply: boolean
  isExpanded: boolean
  onApply: () => void
  onToggleExpand: () => void
}

function ChangeCard({
  change,
  isApplied,
  isApplying,
  disableApply,
  isExpanded,
  onApply,
  onToggleExpand,
}: ChangeCardProps) {
  const typeLabel: Record<ChangeProposal['type'], string> = {
    website_copy: 'Website Copy',
    page: 'Page',
    post: 'Post',
    footer: 'Footer',
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: isApplied ? 'rgba(34,197,94,0.35)' : 'var(--border)',
        background: isApplied ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 px-3 pt-3 pb-2">
        <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: isApplied ? '#22c55e' : 'var(--muted)' }}>
          {isApplied ? '✓' : '✎'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--muted)' }}
            >
              {typeLabel[change.type]}
            </span>
            <span className="text-sm font-medium leading-tight" style={{ color: 'var(--text)' }}>
              {change.title}
            </span>
          </div>
          {change.description && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {change.description}
            </p>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={onToggleExpand}
          className="text-xs flex items-center gap-1 transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          {isExpanded ? '▲ Hide preview' : '▼ Preview changes'}
        </button>
        {isExpanded && <ChangePreview change={change} />}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end px-3 pb-3">
        {isApplied ? (
          <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
            ✓ Applied
          </span>
        ) : (
          <button
            onClick={onApply}
            disabled={disableApply}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(59,130,246,0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
            onMouseEnter={(e) => {
              if (!disableApply) e.currentTarget.style.background = 'rgba(59,130,246,0.28)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.15)'
            }}
          >
            {isApplying ? 'Applying…' : 'Apply'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set())
  const [applyingKey, setApplyingKey] = useState<string | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Helpers ────────────────────────────────────────────────────────────────

  function changeKey(msgId: string, idx: number) {
    return `${msgId}:${idx}`
  }

  // All changes across session (keep original order for right panel)
  const allChanges = messages
    .filter((m) => m.role === 'assistant' && m.changes?.length)
    .flatMap((m) => m.changes!.map((c, i) => ({ change: c, key: changeKey(m.id, i) })))

  const pendingChanges = allChanges.filter((c) => !appliedKeys.has(c.key))
  const appliedChanges = allChanges.filter((c) => appliedKeys.has(c.key))

  function toggleExpand(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // ── Apply a single change ──────────────────────────────────────────────────

  async function applyChange(change: ChangeProposal, key: string) {
    setApplyingKey(key)
    try {
      if (change.type === 'website_copy') {
        await fetch('/api/content/website-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: change.after }),
        })
      } else if (change.type === 'footer') {
        await fetch('/api/content/footer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: change.after }),
        })
      } else if (change.type === 'page') {
        const method = change.id ? 'PUT' : 'POST'
        const url = change.id ? `/api/pages/${change.id}` : '/api/pages'
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.after),
        })
      } else if (change.type === 'post') {
        const method = change.id ? 'PUT' : 'POST'
        const url = change.id ? `/api/posts/${change.id}` : '/api/posts'
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.after),
        })
      }
      setAppliedKeys((prev) => new Set(Array.from(prev).concat(key)))
    } catch (err) {
      console.error('[AIChat] Failed to apply change:', err)
    } finally {
      setApplyingKey(null)
    }
  }

  // ── Apply all pending ──────────────────────────────────────────────────────

  async function applyAll() {
    for (const { change, key } of pendingChanges) {
      await applyChange(change, key)
    }
  }

  // ── File handling ──────────────────────────────────────────────────────────

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
    e.target.value = ''
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Send message ───────────────────────────────────────────────────────────

  async function sendMessage() {
    const text = input.trim()
    if (!text && files.length === 0) return
    if (loading) return

    const attachments: Attachment[] = files.map((f) => ({
      url: URL.createObjectURL(f),
      mimeType: f.type,
      filename: f.name,
    }))

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput('')
    setFiles([])
    setError(null)
    setLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const form = new FormData()
      form.append(
        'messages',
        JSON.stringify(updatedHistory.map((m) => ({ role: m.role, content: m.content })))
      )
      files.forEach((f) => form.append('files', f))

      const res = await fetch('/api/ai/chat', { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply ?? '',
          changes: Array.isArray(data.changes) ? data.changes : [],
          uploadedMedia: Array.isArray(data.uploadedMedia) ? data.uploadedMedia : [],
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function autoResizeTextarea(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 130) + 'px'
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const SUGGESTIONS = [
    'Make the hero heading more exciting',
    'Write a blog post about accessibility in navigation',
    'Update the CTA button text to be more action-oriented',
    'Add the uploaded image as a cover for the homepage',
  ]

  return (
    <div className="flex" style={{ height: '100vh', background: 'var(--bg)' }}>
      {/* ── Left: Chat ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div
          className="flex-shrink-0 border-b px-6 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--muted)' }}>◈</span>
            <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              AI Content Assistant
            </h1>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            Chat to update content, redesign sections, or add images and videos. Review changes on
            the right, then apply.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-64 text-center pt-10">
              <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>
                ◈
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                What would you like to change?
              </p>
              <p className="text-xs mb-6 max-w-sm" style={{ color: 'var(--muted)' }}>
                Describe any content update, paste a design idea, or upload images and videos and
                I&apos;ll propose the changes.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s)
                      textareaRef.current?.focus()
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--muted)'
                      e.currentTarget.style.borderColor = 'var(--border)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span
                className="text-[10px] font-medium px-1 mb-1.5 tracking-wide"
                style={{ color: 'var(--muted)' }}
              >
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </span>

              {/* Attachment previews (user messages) */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2 max-w-[85%]">
                  {msg.attachments.map((a, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {a.mimeType.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.url}
                          alt={a.filename}
                          className="w-28 h-28 object-cover block"
                        />
                      ) : (
                        <div
                          className="w-28 h-28 flex flex-col items-center justify-center gap-1"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}
                        >
                          <span className="text-2xl">▶</span>
                          <span
                            className="text-[10px] px-2 text-center truncate w-full"
                            style={{ color: 'var(--muted)' }}
                          >
                            {a.filename}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bubble */}
              {msg.content && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm max-w-[85%]"
                  style={{
                    background:
                      msg.role === 'user'
                        ? 'rgba(59,130,246,0.14)'
                        : 'rgba(255,255,255,0.06)',
                    color: 'var(--text)',
                    border:
                      msg.role === 'user'
                        ? '1px solid rgba(59,130,246,0.25)'
                        : '1px solid var(--border)',
                    lineHeight: '1.65',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              )}

              {/* Change proposal cards inline (assistant) */}
              {msg.role === 'assistant' && msg.changes && msg.changes.length > 0 && (
                <div className="mt-3 w-full max-w-[85%] space-y-2">
                  <p className="text-xs px-0.5" style={{ color: 'var(--muted)' }}>
                    {msg.changes.length} change{msg.changes.length !== 1 ? 's' : ''} proposed — review and apply below or in the panel →
                  </p>
                  {msg.changes.map((change, i) => {
                    const key = changeKey(msg.id, i)
                    return (
                      <ChangeCard
                        key={key}
                        change={change}
                        cKey={key}
                        isApplied={appliedKeys.has(key)}
                        isApplying={applyingKey === key}
                        disableApply={!!applyingKey}
                        isExpanded={expandedKeys.has(key)}
                        onApply={() => applyChange(change, key)}
                        onToggleExpand={() => toggleExpand(key)}
                      />
                    )
                  })}
                </div>
              )}

              {/* Uploaded media confirmation */}
              {msg.uploadedMedia && msg.uploadedMedia.length > 0 && (
                <p className="text-xs mt-2 px-0.5" style={{ color: 'var(--muted)' }}>
                  ↑ {msg.uploadedMedia.length} file{msg.uploadedMedia.length !== 1 ? 's' : ''} saved to media library
                </p>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-start">
              <span
                className="text-[10px] font-medium px-1 mb-1.5 tracking-wide"
                style={{ color: 'var(--muted)' }}
              >
                AI Assistant
              </span>
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border)',
                  color: 'var(--muted)',
                }}
              >
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ─────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 border-t px-4 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Attached file thumbnails */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2.5">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <div
                    className="rounded-xl overflow-hidden border"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {f.type.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-16 h-16 object-cover block"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 flex flex-col items-center justify-center gap-1"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--muted)' }}
                      >
                        <span className="text-lg">▶</span>
                        <span className="text-[9px] px-1 text-center break-all leading-tight">
                          {f.name.slice(0, 14)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                    style={{ background: 'rgba(239,68,68,0.85)', color: 'white' }}
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFilePick}
            />

            {/* Attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach image or video"
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-base"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              📎
            </button>

            {/* Message input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                autoResizeTextarea(e.target)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you'd like to change… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                maxHeight: 130,
                lineHeight: '1.55',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={loading || (!input.trim() && files.length === 0)}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(59,130,246,0.18)',
                color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = 'rgba(59,130,246,0.32)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.18)'
              }}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Changes panel ────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 border-l flex flex-col"
        style={{ width: 310, borderColor: 'var(--border)' }}
      >
        {/* Panel header */}
        <div
          className="flex-shrink-0 px-4 pt-4 pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Proposed Changes
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {pendingChanges.length > 0
              ? `${pendingChanges.length} pending · ${appliedChanges.length} applied`
              : appliedChanges.length > 0
              ? `All ${appliedChanges.length} applied ✓`
              : 'No changes yet'}
          </p>
        </div>

        {/* Change list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {allChanges.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Changes proposed by the AI will appear here. You can apply each one individually or all at once.
              </p>
            </div>
          )}
          {allChanges.map(({ change, key }) => (
            <ChangeCard
              key={key}
              change={change}
              cKey={key}
              isApplied={appliedKeys.has(key)}
              isApplying={applyingKey === key}
              disableApply={!!applyingKey}
              isExpanded={expandedKeys.has(key)}
              onApply={() => applyChange(change, key)}
              onToggleExpand={() => toggleExpand(key)}
            />
          ))}
        </div>

        {/* Apply All button */}
        {pendingChanges.length > 0 && (
          <div
            className="flex-shrink-0 p-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={applyAll}
              disabled={!!applyingKey}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(59,130,246,0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
              onMouseEnter={(e) => {
                if (!applyingKey) e.currentTarget.style.background = 'rgba(59,130,246,0.28)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.15)'
              }}
            >
              {applyingKey ? 'Applying…' : `Apply All ${pendingChanges.length} Changes`}
            </button>
            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--muted)' }}>
              Changes save to the database immediately
            </p>
          </div>
        )}

        {/* All applied state */}
        {appliedChanges.length > 0 && pendingChanges.length === 0 && (
          <div
            className="flex-shrink-0 p-4 border-t text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
              ✓ All changes applied
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Your website content has been updated. Continue chatting to make more changes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
