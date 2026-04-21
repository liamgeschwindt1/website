'use client'

import { useState, useRef, useCallback } from 'react'

interface MediaItem {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  alt: string | null
  folder: string | null
  createdAt: string
}

interface Props {
  initialMedia: MediaItem[]
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MediaPreview({ item, large = false }: { item: MediaItem; large?: boolean }) {
  if (item.mimeType.startsWith('image/')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.url} alt={item.alt ?? item.filename} className={large ? 'w-full object-contain max-h-56 rounded-[8px]' : 'w-full h-full object-cover'} />
  }
  if (item.mimeType.startsWith('video/')) {
    return large ? (
      <video src={item.url} controls muted preload="metadata" className="w-full max-h-56 object-contain bg-black rounded-[8px]" />
    ) : (
      <video src={item.url} muted preload="metadata" className="w-full h-full object-cover" />
    )
  }
  if (item.mimeType.startsWith('audio/')) {
    return large ? (
      <div className="w-full px-2 py-3">
        <audio src={item.url} controls preload="metadata" className="w-full" />
      </div>
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
        <span className="text-3xl" style={{ color: 'var(--teal)' }}>♪</span>
        <span className="text-[10px] text-center px-2 truncate w-full" style={{ color: 'var(--muted)' }}>{item.filename}</span>
      </div>
    )
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
      <span className="text-3xl" style={{ color: 'var(--muted)' }}>⬕</span>
      <span className="text-[10px] text-center truncate w-full" style={{ color: 'var(--muted)' }}>{item.filename}</span>
    </div>
  )
}

export default function MediaLibraryClient({ initialMedia }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [newFolderInput, setNewFolderInput] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const folders = Array.from(new Set(media.map(m => m.folder).filter(Boolean) as string[])).sort()
  const visibleMedia = media.filter(m => m.folder === currentFolder)

  async function uploadFile(file: File) {
    const form = new FormData()
    form.append('file', file)
    if (currentFolder) form.append('folder', currentFolder)
    setUploading(true)
    try {
      const res = await fetch('/api/media', { method: 'POST', body: form })
      const data = await res.json()
      if (data.media) setMedia(prev => [data.media, ...prev])
    } finally {
      setUploading(false)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const f of Array.from(files)) await uploadFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder])

  async function handleDelete(id: string) {
    if (!confirm('Delete this file permanently?')) return
    await fetch(`/api/media/${id}`, { method: 'DELETE' })
    setMedia(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  async function handleAltUpdate(id: string, alt: string) {
    await fetch(`/api/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt }),
    })
  }

  async function handleMoveToFolder(id: string, folder: string | null) {
    await fetch(`/api/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    })
    setMedia(prev => prev.map(m => m.id === id ? { ...m, folder } : m))
    setSelected(prev => prev && prev.id === id ? { ...prev, folder } : prev)
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(`${window.location.origin}${item.url}`)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function createFolder() {
    const name = newFolderInput.trim()
    if (!name) return
    setCurrentFolder(name)
    setNewFolderInput('')
    setShowNewFolder(false)
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Folder sidebar */}
      <nav className="w-[180px] border-r flex-shrink-0 flex flex-col py-4" style={{ borderColor: 'var(--border)', background: 'rgba(3,12,19,0.7)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest px-4 mb-2" style={{ color: 'var(--muted)' }}>Folders</p>
        <button
          type="button"
          onClick={() => { setCurrentFolder(null); setSelected(null) }}
          className="w-full text-left px-4 py-1.5 text-[13px] transition-colors"
          style={{ background: currentFolder === null ? 'rgba(1,180,175,0.1)' : 'transparent', color: currentFolder === null ? 'var(--teal)' : 'var(--muted)' }}
        >
          All files
        </button>
        {folders.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => { setCurrentFolder(f); setSelected(null) }}
            className="w-full text-left px-4 py-1.5 text-[13px] truncate transition-colors"
            style={{ background: currentFolder === f ? 'rgba(1,180,175,0.1)' : 'transparent', color: currentFolder === f ? 'var(--teal)' : 'var(--muted)' }}
          >
            / {f}
          </button>
        ))}
        <div className="mt-auto px-4 pt-4">
          {showNewFolder ? (
            <div className="flex flex-col gap-1.5">
              <input
                autoFocus
                type="text"
                value={newFolderInput}
                onChange={e => setNewFolderInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolder(false) }}
                placeholder="Folder name"
                className="w-full px-2 py-1.5 rounded-[5px] text-[12px] border focus:outline-none focus:border-[var(--teal)]"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <div className="flex gap-1">
                <button type="button" onClick={createFolder} className="flex-1 py-1 rounded-[5px] text-[11px]" style={{ background: 'var(--teal)', color: '#031119' }}>Create</button>
                <button type="button" onClick={() => setShowNewFolder(false)} className="flex-1 py-1 rounded-[5px] text-[11px] border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewFolder(true)}
              className="w-full py-1.5 rounded-[5px] text-[12px] border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              + New folder
            </button>
          )}
        </div>
      </nav>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
              {currentFolder ? `/ ${currentFolder}` : 'Media Library'}
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>{visibleMedia.length} files</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-[13px] font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            {uploading ? 'Uploading…' : '↑ Upload'}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,application/pdf"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        <div
          className="mx-6 mb-4 rounded-[10px] border-2 border-dashed flex items-center justify-center py-5 text-[13px] transition-all duration-200 flex-shrink-0"
          style={{
            borderColor: dragOver ? 'var(--teal)' : 'rgba(255,255,255,0.12)',
            background: dragOver ? 'rgba(1,180,175,0.06)' : 'transparent',
            color: dragOver ? 'var(--teal)' : 'var(--muted)',
          }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          Drop files here to upload{currentFolder ? ` into /${currentFolder}` : ''}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {visibleMedia.length === 0 ? (
            <div className="py-20 text-center" style={{ color: 'var(--muted)' }}>No files here. Upload something above.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visibleMedia.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}
                  className="group relative rounded-[10px] border overflow-hidden aspect-square text-left transition-all duration-150"
                  style={{
                    borderColor: selected?.id === item.id ? 'var(--teal)' : 'var(--border)',
                    background: 'rgba(255,255,255,0.03)',
                    outline: selected?.id === item.id ? '2px solid var(--teal)' : 'none',
                    outlineOffset: '1px',
                  }}
                >
                  <MediaPreview item={item} />
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(3,17,25,0.85)' }}>
                    <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>{item.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <aside className="w-[290px] border-l flex-shrink-0 overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'rgba(3,12,19,0.95)' }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>File details</span>
            <button type="button" onClick={() => setSelected(null)} className="text-[18px] leading-none" style={{ color: 'var(--muted)' }}>×</button>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <MediaPreview item={selected} large />
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>Filename</p>
              <p className="text-[13px] break-all" style={{ color: 'var(--text)' }}>{selected.filename}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>Size</p>
                <p className="text-[13px]" style={{ color: 'var(--text)' }}>{formatBytes(selected.size)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>Type</p>
                <p className="text-[13px]" style={{ color: 'var(--text)' }}>{selected.mimeType.split('/')[1]?.toUpperCase()}</p>
              </div>
            </div>
            {selected.mimeType.startsWith('image/') && (
              <div>
                <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>Alt text</p>
                <input
                  type="text"
                  defaultValue={selected.alt ?? ''}
                  onBlur={e => handleAltUpdate(selected.id, e.target.value)}
                  placeholder="Describe the image…"
                  className="w-full px-3 py-2 rounded-[6px] text-[13px] border focus:outline-none focus:border-[var(--teal)]"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>Folder</p>
              <select
                value={selected.folder ?? ''}
                onChange={e => handleMoveToFolder(selected.id, e.target.value || null)}
                className="w-full px-3 py-2 rounded-[6px] text-[13px] border focus:outline-none focus:border-[var(--teal)]"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="">/ Root</option>
                {folders.map(f => <option key={f} value={f}>/ {f}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>URL</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`/api/media/${selected.id}`}
                  className="flex-1 px-3 py-2 rounded-[6px] text-[12px] border font-mono"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)', color: 'var(--muted)' }}
                />
                <button
                  type="button"
                  onClick={() => copyUrl(selected)}
                  className="px-3 py-2 rounded-[6px] text-[12px] border transition-colors duration-150"
                  style={copiedId === selected.id
                    ? { borderColor: 'var(--teal)', color: 'var(--teal)', background: 'rgba(1,180,175,0.08)' }
                    : { borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }
                  }
                >
                  {copiedId === selected.id ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
            <a
              href={selected.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-[6px] text-[13px] font-medium border text-center no-underline block"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Open in new tab ↗
            </a>
            <button
              type="button"
              onClick={() => handleDelete(selected.id)}
              className="w-full py-2 rounded-[6px] text-[13px] font-medium border"
              style={{ borderColor: 'rgba(248,113,113,0.3)', color: '#f87171', background: 'transparent' }}
            >
              Delete file
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
