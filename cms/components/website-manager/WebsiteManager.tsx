'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type EditableFile = {
  path: string
  size: number
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const PREVIEW_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://touchpulse-production.up.railway.app'
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
      text: 'Placeholder AI is ready. Ask for changes in plain text. For deterministic drafts, try: replace "old" with "new".',
    },
  ])
  const [aiProposal, setAiProposal] = useState<string | null>(null)
  const [prTitle, setPrTitle] = useState('Website update from manager')
  const [prBody, setPrBody] = useState('Created in Website Manager after review and preview.')
  const [creatingPr, setCreatingPr] = useState(false)
  const [prResult, setPrResult] = useState<{ number: number; url: string } | null>(null)
  const [previewPath, setPreviewPath] = useState('/')
  const draftsRef = useRef<Record<string, string>>({})

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

  async function askPlaceholderAi() {
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
          title: prTitle,
          body: `${prBody}\n\nChanged files:\n${changedFiles.map((f) => `- touchpulse/${f.path}`).join('\n')}`,
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
    <div className="p-6 md:p-8" style={{ color: 'var(--text)' }}>
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Website Manager</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>
          Edit website code, collaborate through AI prompts, preview, and push reviewed changes to GitHub as a production PR.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_360px] gap-4">
        <section className="rounded-[12px] border p-4" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.16)' }}>
          <p className="text-[12px] uppercase tracking-wide mb-3" style={{ color: 'var(--muted)' }}>Editable files</p>
          {loadingFiles ? (
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Loading files…</p>
          ) : (
            <div className="max-h-[420px] overflow-auto space-y-1 pr-1">
              {files.map((f) => {
                const selected = f.path === filePath
                const changed = f.path in drafts
                return (
                  <button
                    key={f.path}
                    type="button"
                    onClick={() => setFilePath(f.path)}
                    className="w-full text-left px-2.5 py-2 rounded-[8px] border text-[12px] transition-colors"
                    style={
                      selected
                        ? { borderColor: 'var(--teal)', background: 'rgba(1,180,175,0.12)', color: 'var(--teal)' }
                        : { borderColor: 'transparent', background: 'rgba(255,255,255,0.02)', color: 'var(--text)' }
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{f.path}</span>
                      {changed && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(250,204,21,0.16)', color: '#facc15' }}>draft</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-[12px] border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.12)' }}>
          <div className="px-4 py-3 border-b flex flex-wrap gap-2 items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[12px]" style={{ color: 'var(--muted)' }}>{filePath || 'No file selected'}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cacheDraft(original)}
                disabled={!dirty || loadingFile}
                className="px-3 py-1.5 rounded-[7px] text-[12px] border disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={saveToWorkspace}
                disabled={saving || loadingFile || !dirty}
                className="px-3 py-1.5 rounded-[7px] text-[12px] disabled:opacity-50"
                style={{ background: 'var(--teal)', color: '#031119' }}
              >
                {saving ? 'Saving…' : 'Save To Workspace'}
              </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => cacheDraft(e.target.value)}
            disabled={loadingFile || !filePath}
            className="w-full h-[420px] p-4 text-[12px] leading-[1.6] resize-none outline-none"
            style={{ background: 'rgba(3,12,19,0.88)', color: '#d6eef0', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          />

          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px]" style={{ color: dirty ? '#facc15' : 'var(--muted)' }}>
                {dirty ? 'Unsaved draft changes in editor.' : 'No unsaved changes in current file.'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{changedFiles.length} file(s) ready for PR</p>
            </div>
            {status && <p className="text-[12px] mt-2" style={{ color: 'var(--teal)' }}>{status}</p>}
          </div>
        </section>

        <section className="rounded-[12px] border p-4" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.16)' }}>
          <p className="text-[12px] uppercase tracking-wide mb-3" style={{ color: 'var(--muted)' }}>AI editor chat (placeholder)</p>
          <div className="h-[230px] overflow-auto rounded-[8px] border p-3 space-y-2" style={{ borderColor: 'var(--border)', background: 'rgba(3,12,19,0.72)' }}>
            {chat.map((m) => (
              <div key={m.id} className="text-[12px] leading-[1.5]">
                <span style={{ color: m.role === 'assistant' ? 'var(--teal)' : '#94b8ff' }}>
                  {m.role === 'assistant' ? 'AI' : 'You'}:
                </span>{' '}
                <span style={{ color: 'var(--text)' }}>{m.text}</span>
              </div>
            ))}
          </div>
          <textarea
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            rows={3}
            placeholder="Tell AI what to change in the selected file"
            className="mt-3 w-full px-3 py-2 rounded-[8px] border text-[12px] resize-none"
            style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)' }}
          />
          <button
            type="button"
            onClick={askPlaceholderAi}
            disabled={chatLoading || !chatPrompt.trim() || !filePath}
            className="mt-2 w-full py-2 rounded-[8px] text-[12px] disabled:opacity-50"
            style={{ background: 'rgba(1,180,175,0.18)', color: 'var(--teal)', border: '1px solid rgba(1,180,175,0.35)' }}
          >
            {chatLoading ? 'Thinking…' : 'Send To AI'}
          </button>

          {aiProposal && (
            <button
              type="button"
              onClick={() => {
                cacheDraft(aiProposal)
                setAiProposal(null)
              }}
              className="mt-2 w-full py-2 rounded-[8px] text-[12px]"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              Apply AI Draft To Editor
            </button>
          )}

          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[12px] uppercase tracking-wide mb-2" style={{ color: 'var(--muted)' }}>Preview + production</p>
            <input
              value={previewPath}
              onChange={(e) => setPreviewPath(e.target.value)}
              placeholder="/"
              className="w-full px-3 py-2 rounded-[8px] border text-[12px]"
              style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)' }}
            />
            <a
              href={`${PREVIEW_URL}${previewPath.startsWith('/') ? previewPath : `/${previewPath}`}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full text-center py-2 rounded-[8px] text-[12px] no-underline"
              style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'rgba(255,255,255,0.02)' }}
            >
              Open Live Preview ↗
            </a>

            <input
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              className="mt-3 w-full px-3 py-2 rounded-[8px] border text-[12px]"
              style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)' }}
              placeholder="PR title"
            />
            <textarea
              value={prBody}
              onChange={(e) => setPrBody(e.target.value)}
              rows={3}
              className="mt-2 w-full px-3 py-2 rounded-[8px] border text-[12px] resize-none"
              style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)' }}
              placeholder="PR description"
            />

            <button
              type="button"
              onClick={pushToProduction}
              disabled={creatingPr || changedFiles.length === 0}
              className="mt-2 w-full py-2 rounded-[8px] text-[12px] font-medium disabled:opacity-50"
              style={{ background: '#7dd3fc', color: '#082f49' }}
            >
              {creatingPr ? 'Creating Pull Request…' : 'Push To Production (Create PR)'}
            </button>

            {prResult && (
              <a
                href={prResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-[12px] no-underline"
                style={{ color: 'var(--teal)' }}
              >
                Open PR #{prResult.number} ↗
              </a>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 rounded-[12px] border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <iframe
          title="Website preview"
          src={`${PREVIEW_URL}${previewPath.startsWith('/') ? previewPath : `/${previewPath}`}`}
          className="w-full h-[460px]"
          style={{ border: 0, background: '#020b11' }}
        />
      </div>
    </div>
  )
}
