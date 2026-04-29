'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface FileEntry {
  path: string
  size: number
}

declare global {
  interface Window {
    CodeMirror?: ((el: HTMLElement, opts: object) => CMEditor) & {
      fromTextArea?: (el: HTMLTextAreaElement, opts: object) => CMEditor
    }
  }
}

interface CMEditor {
  getValue(): string
  setValue(v: string): void
  on(event: string, handler: () => void): void
  setOption(key: string, value: unknown): void
  refresh(): void
}

export default function CodeEditorPage() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [filesError, setFilesError] = useState('')
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [pushingPR, setPushingPR] = useState(false)
  const [prMsg, setPrMsg] = useState('')
  const editorRef = useRef<CMEditor | null>(null)
  const editorDivRef = useRef<HTMLDivElement>(null)
  const cmLoaded = useRef(false)
  const [cmReady, setCmReady] = useState(false)

  const unsavedCount = content !== savedContent ? 1 : 0

  // Load file list
  useEffect(() => {
    fetch('/api/website-manager/files')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.files) setFiles(data.files)
        else setFilesError('Could not load file list.')
      })
      .catch(() => setFilesError('Network error loading files.'))
  }, [])

  // Load CodeMirror from CDN
  useEffect(() => {
    if (cmLoaded.current) return
    cmLoaded.current = true

    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = src
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(s)
    })
    const loadCss = (href: string) => {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }

    const base = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16'
    loadCss(`${base}/codemirror.min.css`)
    loadCss(`${base}/theme/material-darker.min.css`)

    loadScript(`${base}/codemirror.min.js`)
      .then(() => loadScript(`${base}/mode/javascript/javascript.min.js`))
      .then(() => loadScript(`${base}/mode/jsx/jsx.min.js`).catch(() => {}))
      .then(() => {
        // Force CodeMirror elements to fill their container
        const s = document.createElement('style')
        s.textContent = `.CodeMirror { height: 100% !important; font-size: 13px !important; } .CodeMirror-scroll { height: 100% !important; }`
        document.head.appendChild(s)
        setCmReady(true)
      })
      .catch(() => setCmReady(true)) // proceed even without jsx mode
  }, [])

  // Mount CodeMirror once ready and div exists
  useEffect(() => {
    if (!cmReady || !editorDivRef.current || editorRef.current) return
    if (typeof window.CodeMirror !== 'function') return

    const editor = window.CodeMirror(editorDivRef.current, {
      value: '',
      mode: { name: 'javascript', typescript: true },
      theme: 'material-darker',
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      indentWithTabs: false,
      autofocus: false,
    })

    editor.on('change', () => setContent(editor.getValue()))
    editorRef.current = editor

    // Apply full height to the CodeMirror wrapper
    const wrapper = editorDivRef.current.querySelector('.CodeMirror') as HTMLElement | null
    if (wrapper) {
      wrapper.style.height = '100%'
      wrapper.style.fontSize = '13px'
      wrapper.style.fontFamily = 'var(--font-jetbrains-mono, monospace)'
    }
  }, [cmReady])

  const loadFile = useCallback(async (path: string) => {
    setLoading(true)
    setSaveMsg('')
    setPrMsg('')
    try {
      const res = await fetch(`/api/website-manager/file?path=${encodeURIComponent(path)}`)
      if (!res.ok) throw new Error('Failed to load file')
      const data = await res.json() as { content: string }
      setContent(data.content)
      setSavedContent(data.content)
      setActiveFile(path)
      if (editorRef.current) {
        editorRef.current.setValue(data.content)
        editorRef.current.refresh()
      }
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  function resetFile() {
    if (!activeFile) return
    setContent(savedContent)
    editorRef.current?.setValue(savedContent)
  }

  async function saveFile() {
    if (!activeFile) return
    setSaving(true)
    setSaveMsg('')
    try {
      const currentContent = editorRef.current ? editorRef.current.getValue() : content
      const res = await fetch('/api/website-manager/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeFile, content: currentContent }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSavedContent(currentContent)
      setContent(currentContent)
      setSaveMsg('✓ Saved to workspace')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function pushToPR() {
    if (!activeFile) return
    setPushingPR(true)
    setPrMsg('')
    try {
      const currentContent = editorRef.current ? editorRef.current.getValue() : content
      const res = await fetch('/api/github/website-manager/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Code Editor: edit ${activeFile}`,
          body: `Updated \`${activeFile}\` via CMS Code Editor.`,
          files: [{ path: `touchpulse/${activeFile}`, content: currentContent }],
        }),
      })
      const data = await res.json() as { url?: string; number?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'PR failed')
      setPrMsg(`✓ PR #${data.number} created`)
      if (data.url) window.open(data.url, '_blank')
    } catch (e: unknown) {
      setPrMsg(e instanceof Error ? e.message : 'PR failed')
    } finally {
      setPushingPR(false)
    }
  }

  // Group files by directory
  const grouped = files.reduce<Record<string, FileEntry[]>>((acc, f) => {
    const parts = f.path.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!acc[dir]) acc[dir] = []
    acc[dir].push(f)
    return acc
  }, {})
  const sortedDirs = Object.keys(grouped).sort()

  return (
    <div style={{ display: 'flex', height: 'calc(100vh)', overflow: 'hidden' }}>
      {/* Left — file tree */}
      <div
        className="flex-shrink-0 overflow-y-auto border-r"
        style={{ width: '30%', borderColor: 'var(--border)', background: 'rgba(3,12,19,0.5)' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[11px] uppercase tracking-[0.08em] font-semibold" style={{ color: 'var(--muted)' }}>
            Touchpulse files
          </p>
        </div>
        {filesError && (
          <p className="px-4 py-3 text-[12px]" style={{ color: '#f87171' }}>{filesError}</p>
        )}
        {sortedDirs.map(dir => (
          <div key={dir}>
            <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.07em] font-medium" style={{ color: 'var(--muted)' }}>
              {dir === '.' ? 'root' : dir}
            </p>
            {grouped[dir].map(f => {
              const filename = f.path.split('/').pop() ?? f.path
              const active = activeFile === f.path
              return (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => loadFile(f.path)}
                  className="w-full text-left flex items-center gap-2 px-4 py-1.5 text-[12px] transition-colors"
                  style={active
                    ? { color: 'var(--teal)', background: 'rgba(1,180,175,0.1)' }
                    : { color: 'var(--text)' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                    {filename.endsWith('.tsx') || filename.endsWith('.ts') ? '⌥' : filename.endsWith('.json') ? '{}' : '▪'}
                  </span>
                  <span className="truncate">{filename}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Right — editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0 border-b"
          style={{ height: 48, borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {activeFile ? (
              <>
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>touchpulse /</span>
                <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{activeFile}</span>
              </>
            ) : (
              <span className="text-[13px]" style={{ color: 'var(--muted)' }}>Select a file</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {activeFile && (
              <>
                <button
                  type="button"
                  onClick={resetFile}
                  disabled={unsavedCount === 0}
                  className="px-3 py-1.5 rounded-[6px] text-[12px] border disabled:opacity-40"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveFile}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium border disabled:opacity-50"
                  style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'transparent' }}
                >
                  {saving ? 'Saving…' : 'Save to workspace'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'rgba(3,12,19,0.7)' }}>
              <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Loading…</p>
            </div>
          )}
          {!activeFile && !loading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--muted)', zIndex: 1 }}>
              <p className="text-[13px]">Select a file from the tree to edit it.</p>
            </div>
          )}
          <div
            ref={editorDivRef}
            style={{ height: '100%', width: '100%', display: 'block' }}
          />
        </div>

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0 border-t"
          style={{ height: 40, borderColor: 'var(--border)', background: 'rgba(3,12,19,0.6)' }}
        >
          <div className="flex items-center gap-4">
            {activeFile && (
              <span className="text-[11px]" style={{ color: unsavedCount > 0 ? '#facc15' : 'var(--muted)' }}>
                {unsavedCount > 0 ? `● ${unsavedCount} unsaved change` : '○ No unsaved changes'}
              </span>
            )}
            {saveMsg && <span className="text-[11px]" style={{ color: saveMsg.startsWith('✓') ? 'var(--teal)' : '#f87171' }}>{saveMsg}</span>}
            {prMsg && <span className="text-[11px]" style={{ color: prMsg.startsWith('✓') ? 'var(--teal)' : '#f87171' }}>{prMsg}</span>}
          </div>
          {activeFile && (
            <button
              type="button"
              onClick={pushToPR}
              disabled={pushingPR}
              className="px-4 py-1.5 rounded-[6px] text-[12px] font-medium disabled:opacity-50"
              style={{ background: 'var(--teal)', color: '#031119' }}
            >
              {pushingPR ? 'Creating PR…' : 'Push to Production (PR)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
