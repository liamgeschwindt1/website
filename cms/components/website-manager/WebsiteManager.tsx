'use client'

import { useEffect, useMemo, useRef, useState, KeyboardEvent as ReactKeyboardEvent } from 'react'

type EditableFile = {
  path: string
  size: number
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const STORAGE_KEY = 'tp-website-manager-drafts-v1'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function WebsiteManager() {
  const [files, setFiles] = useState<EditableFile[]>([])
  const [filePath, setFilePath] = useState('')
  const [content, setContent] = useState('')
  const [original, setOriginal] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [chatPrompt, setChatPrompt] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      text: 'Select a file and tell me what to change. I will propose a diff you can apply.',
    },
  ])
  const [aiProposal, setAiProposal] = useState<string | null>(null)
  const [creatingPr, setCreatingPr] = useState(false)
  const [prResult, setPrResult] = useState<{ number: number; url: string } | null>(null)
  const draftsRef = useRef<Record<string, string>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)

  const dirty = content !== original
  const changedFiles = useMemo(
    () => Object.entries(drafts).map(([path, body]) => ({ path, content: body })),
    [drafts],
  )

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Record<string, string>
      draftsRef.current = parsed
      setDrafts(parsed)
    } catch {
      // Ignore invalid draft cache.
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
    draftsRef.current = drafts
  }, [drafts])

  useEffect(() => {
    let mounted = true
    setLoadingFiles(true)
    fetch('/api/website-manager/files')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed to load editable files')
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        const allFiles = (data.files ?? []) as EditableFile[]
        setFiles(allFiles)
        if (!filePath && allFiles.length > 0) {
          setFilePath(allFiles[0].path)
        }
      })
      .catch((error) => {
        if (!mounted) return
        setStatus(error instanceof Error ? error.message : 'Failed to load editable files')
      })
      .finally(() => {
        if (!mounted) return
        setLoadingFiles(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!filePath) return
    let mounted = true
    setLoadingFile(true)
    setStatus('')
    fetch(`/api/website-manager/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed to load file')
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        const nextOriginal = data.content as string
        setOriginal(nextOriginal)
        setContent(draftsRef.current[filePath] ?? nextOriginal)
      })
      .catch((error) => {
        if (!mounted) return
        setStatus(error instanceof Error ? error.message : 'Failed to load file')
      })
      .finally(() => {
        if (!mounted) return
        setLoadingFile(false)
      })

    return () => {
      mounted = false
    }
  }, [filePath])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  function cacheDraft(nextContent: string) {
    setContent(nextContent)
    setDrafts((prev) => {
      const next = { ...prev }
      if (nextContent === original) delete next[filePath]
      else next[filePath] = nextContent
      return next
    })
  }

  async function saveToWorkspace() {
    setSaving(true)
    setStatus('')
    try {
      const res = await fetch('/api/website-manager/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Failed to save file')

      setOriginal(content)
      setDrafts((prev) => ({ ...prev, [filePath]: content }))
      setStatus(`Saved ${filePath} to workspace and staged for PR.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save file')
    } finally {
      setSaving(false)
    }
  }

  async function askAi() {
    const prompt = chatPrompt.trim()
    if (!prompt || !filePath) return

    const userMsg: ChatMessage = { id: uid(), role: 'user', text: prompt }
    setChat((prev) => [...prev, userMsg])
    setChatPrompt('')
    setChatLoading(true)
    setAiProposal(null)

    try {
      const res = await fetch('/api/website-manager/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, filePath, content }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'AI request failed')

      setChat((prev) => [...prev, { id: uid(), role: 'assistant', text: data.reply ?? 'No response' }])
      if (typeof data.proposedContent === 'string' && data.proposedContent !== content) {
        setAiProposal(data.proposedContent)
      }
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          text: error instanceof Error ? error.message : 'AI request failed',
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  async function pushToProduction() {
    if (changedFiles.length === 0) return
    setCreatingPr(true)
    setStatus('')
    setPrResult(null)

    try {
      const res = await fetch('/api/github/website-manager/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Website update from manager',
          body: `Created in Website Manager.\n\nChanged files:\n${changedFiles.map((f) => `- touchpulse/${f.path}`).join('\n')}`,
          files: changedFiles,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Failed to create pull request')

      setPrResult({ number: data.number, url: data.url })
      setDrafts({})
      setStatus(`Created PR #${data.number}.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create pull request')
    } finally {
      setCreatingPr(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 0px)', color: 'var(--text)' }}>
      {/* Page header with single action */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Website Manager</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
            {changedFiles.length > 0 ? `${changedFiles.length} file(s) staged` : 'Browse files, edit, chat with AI, then push to GitHub.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <p className="text-[12px]" style={{ color: status.startsWith('Created') ? 'var(--teal)' : '#f87171' }}>{status}</p>
          )}
          {prResult && (
            <a href={prResult.url} target="_blank" rel="noopener noreferrer" className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>
              PR #{prResult.number} ↗
            </a>
          )}
          <button
            type="button"
            onClick={pushToProduction}
            disabled={creatingPr || changedFiles.length === 0}
            className="px-4 py-2 rounded-[8px] text-[13px] font-medium disabled:opacity-40 transition-opacity"
            style={{ background: '#7dd3fc', color: '#082f49' }}
          >
            {creatingPr ? 'Creating PR…' : 'Push to Production (Create PR)'}
          </button>
        </div>
      </div>

      {/* Two-column main area */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT COLUMN — file tree + editor */}
        <div className="flex flex-col flex-1 min-w-0 border-r" style={{ borderColor: 'var(--border)' }}>

          {/* File tree */}
          <div className="border-b px-4 py-3 flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.16)' }}>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Files</p>
            {loadingFiles ? (
              <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Loading…</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-[96px] overflow-auto">
                {files.map((f) => {
                  const selected = f.path === filePath
                  const changed = f.path in drafts
                  return (
                    <button
                      key={f.path}
                      type="button"
                      onClick={() => setFilePath(f.path)}
                      className="px-2.5 py-1 rounded-[6px] border text-[11px] transition-colors flex items-center gap-1.5"
                      style={
                        selected
                          ? { borderColor: 'var(--teal)', background: 'rgba(1,180,175,0.12)', color: 'var(--teal)' }
                          : { borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text)' }
                      }
                    >
                      {f.path}
                      {changed && (
                        <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: 'rgba(250,204,21,0.16)', color: '#facc15' }}>●</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Editor toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] flex-1 truncate" style={{ color: dirty ? '#facc15' : 'var(--muted)' }}>
              {filePath || 'No file selected'}{dirty ? '  ●' : ''}
            </p>
            <button
              type="button"
              onClick={() => cacheDraft(original)}
              disabled={!dirty || loadingFile}
              className="px-2.5 py-1 rounded-[6px] text-[11px] border disabled:opacity-40"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={saveToWorkspace}
              disabled={saving || loadingFile || !dirty}
              className="px-2.5 py-1 rounded-[6px] text-[11px] disabled:opacity-40"
              style={{ background: 'rgba(1,180,175,0.18)', color: 'var(--teal)', border: '1px solid rgba(1,180,175,0.35)' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          {/* Code editor */}
          <textarea
            value={content}
            onChange={(e) => cacheDraft(e.target.value)}
            disabled={loadingFile || !filePath}
            className="flex-1 p-4 text-[12px] leading-[1.6] resize-none outline-none"
            style={{ background: 'rgba(3,12,19,0.88)', color: '#d6eef0', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', minHeight: 0 }}
          />
        </div>

        {/* RIGHT COLUMN — AI chat */}
        <div className="flex flex-col w-[360px] flex-shrink-0" style={{ background: 'rgba(27,53,79,0.10)' }}>
          <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>AI Chat</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3 min-h-0">
            {chat.map((m) => (
              <div key={m.id} className="text-[12px] leading-[1.6]">
                <span className="font-medium" style={{ color: m.role === 'assistant' ? 'var(--teal)' : '#94b8ff' }}>
                  {m.role === 'assistant' ? 'AI' : 'You'}:
                </span>{' '}
                <span style={{ color: 'var(--text)' }}>{m.text}</span>
              </div>
            ))}
            {chatLoading && (
              <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
                <span style={{ color: 'var(--teal)' }}>AI:</span> Thinking…
              </div>
            )}
            {aiProposal && (
              <div className="rounded-[8px] border p-3" style={{ borderColor: 'rgba(1,180,175,0.35)', background: 'rgba(1,180,175,0.06)' }}>
                <p className="text-[11px] mb-2" style={{ color: 'var(--teal)' }}>AI proposed a change. Apply to editor?</p>
                <button
                  type="button"
                  onClick={() => { cacheDraft(aiProposal); setAiProposal(null) }}
                  className="w-full py-1.5 rounded-[6px] text-[11px] font-medium"
                  style={{ background: 'var(--teal)', color: '#031119' }}
                >
                  Apply to Editor
                </button>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <textarea
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              onKeyDown={(e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAi() }
              }}
              rows={3}
              placeholder={filePath ? `Tell AI what to change in ${filePath.split('/').pop()}…` : 'Select a file first'}
              disabled={!filePath}
              className="w-full px-3 py-2 rounded-[8px] border text-[12px] resize-none"
              style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)' }}
            />
            <button
              type="button"
              onClick={askAi}
              disabled={chatLoading || !chatPrompt.trim() || !filePath}
              className="mt-2 w-full py-2 rounded-[8px] text-[12px] disabled:opacity-50"
              style={{ background: 'rgba(1,180,175,0.18)', color: 'var(--teal)', border: '1px solid rgba(1,180,175,0.35)' }}
            >
              {chatLoading ? 'Thinking…' : 'Send (Enter)'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
