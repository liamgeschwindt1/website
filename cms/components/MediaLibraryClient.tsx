'use client'

import { useState, useRef, useCallback } from 'react'
import { isImage, isVideo, isAudio, formatBytes, toggleButtonStyle } from '@/lib/utils'

interface MediaItem {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  alt: string | null
  createdAt: string
}

interface Props {
  initialMedia: MediaItem[]
  loadError?: string
}

export default function MediaLibraryClient({ initialMedia, loadError = '' }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all')
  const [mediaError, setMediaError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    const form = new FormData()
    form.append('file', file)
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
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this file permanently?')) return
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setMedia(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch {
      setMediaError('Failed to delete file. Please try again.')
    }
  }

  async function handleAltUpdate(id: string, alt: string) {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt }),
      })
      if (!res.ok) throw new Error('Update failed')
    } catch {
      setMediaError('Failed to save alt text.')
    }
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(`${window.location.origin}${item.url}`)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const filtered = filter === 'all' ? media
    : filter === 'image' ? media.filter(m => isImage(m.mimeType))
    : filter === 'video' ? media.filter(m => isVideo(m.mimeType))
    : filter === 'audio' ? media.filter(m => isAudio(m.mimeType))
    : media.filter(m => !isImage(m.mimeType) && !isVideo(m.mimeType) && !isAudio(m.mimeType))

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Media Library</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>{media.length} files</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-[13px] font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            {uploading ? 'Uploading…' : '↑ Upload files'}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*,application/pdf" className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>

        {mediaError && (
          <div className="mx-8 mb-2 px-4 py-3 rounded-[8px] text-[13px] flex items-center justify-between" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            {mediaError}
            <button type="button" onClick={() => setMediaError('')} className="ml-4 text-[16px] leading-none opacity-70 hover:opacity-100">×</button>
          </div>
        )}

        {loadError && (
          <div className="mx-8 mb-2 px-4 py-3 rounded-[8px] text-[13px]" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            {loadError}
          </div>
        )}

        {/* Drop zone */}
        <div
          className="mx-8 mb-5 rounded-[10px] border-2 border-dashed flex items-center justify-center py-6 text-[13px] transition-all duration-200 flex-shrink-0"
          style={{
            borderColor: dragOver ? 'var(--teal)' : 'rgba(255,255,255,0.12)',
            background: dragOver ? 'rgba(1,180,175,0.06)' : 'transparent',
            color: dragOver ? 'var(--teal)' : 'var(--muted)',
          }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          Drop files here to upload
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-8 mb-4 flex-shrink-0">
          {(['all', 'image', 'video', 'audio', 'document'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-[11px] font-medium border transition-all"
              style={toggleButtonStyle(filter === f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {media.length === 0 ? (
            <div className="py-20 text-center" style={{ color: 'var(--muted)' }}>No files yet. Upload something above.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(item => (
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
                  {isImage(item.mimeType) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.alt ?? item.filename} className="w-full h-full object-cover" />
                  ) : isVideo(item.mimeType) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      <span className="text-3xl">🎬</span>
                      <span className="text-[10px] text-center truncate w-full" style={{ color: 'var(--muted)' }}>{item.filename}</span>
                    </div>
                  ) : isAudio(item.mimeType) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      <span className="text-3xl">🎵</span>
                      <span className="text-[10px] text-center truncate w-full" style={{ color: 'var(--muted)' }}>{item.filename}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                      <span className="text-3xl">📄</span>
                      <span className="text-[11px] text-center truncate w-full" style={{ color: 'var(--muted)' }}>{item.filename}</span>
                    </div>
                  )} 
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(3,17,25,0.85)' }}>
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
        <aside className="w-[280px] border-l flex-shrink-0 overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'rgba(3,12,19,0.95)' }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>File details</span>
            <button type="button" onClick={() => setSelected(null)} className="text-[18px] leading-none" style={{ color: 'var(--muted)' }}>×</button>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {isImage(selected.mimeType) && (
              <div className="rounded-[8px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.url} alt={selected.alt ?? selected.filename} className="w-full object-contain max-h-40" />
              </div>
            )}
            {isVideo(selected.mimeType) && (
              <div className="rounded-[8px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={selected.url} controls className="w-full max-h-48" style={{ background: '#000' }} />
              </div>
            )}
            {isAudio(selected.mimeType) && (
              <div className="rounded-[8px] p-3 border" style={{ borderColor: 'var(--border)', background: 'rgba(1,180,175,0.05)' }}>
                <div className="text-center text-3xl mb-2">🎵</div>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio src={selected.url} controls className="w-full" />
              </div>
            )}
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
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>URL</p>
              <div className="flex gap-2">
                <input readOnly value={`/api/media/${selected.id}`} className="flex-1 px-3 py-2 rounded-[6px] text-[12px] border font-mono" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)', color: 'var(--muted)' }} />
                <button type="button" onClick={() => copyUrl(selected)}
                  className="px-3 py-2 rounded-[6px] text-[12px] border transition-colors duration-150"
                  style={copiedId === selected.id
                    ? { borderColor: 'var(--teal)', color: 'var(--teal)', background: 'rgba(1,180,175,0.08)' }
                    : { borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }
                  }>
                  {copiedId === selected.id ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(selected.id)}
              className="w-full py-2 rounded-[6px] text-[13px] font-medium border mt-2 transition-colors duration-150"
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
