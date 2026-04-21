'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface MediaItem {
  id: string
  filename: string
  mimeType: string
  url: string
  alt: string | null
}

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImagePicker({ value, onChange, label = 'Cover image' }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && tab === 'library') {
      setLoading(true)
      fetch('/api/media')
        .then(r => r.json())
        .then(data => setMedia(data.filter((m: MediaItem) => m.mimeType.startsWith('image/'))))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [open, tab])

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name.replace(/\.[^.]+$/, ''))
      const res = await fetch('/api/media', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const item: MediaItem = await res.json()
      onChange(item.url)
      setOpen(false)
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--muted)' }}>{label}</label>

      {/* Preview + controls */}
      <div className="flex gap-3 items-start">
        {value ? (
          <div className="relative w-[120px] h-[80px] rounded-[8px] overflow-hidden border flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-[120px] h-[80px] rounded-[8px] border flex items-center justify-center flex-shrink-0 text-[11px]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'rgba(255,255,255,0.02)' }}>
            No image
          </div>
        )}
        <div className="flex flex-col gap-2 flex-1">
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://… or pick below"
            className="w-full px-3 py-2 rounded-[8px] border bg-transparent text-[13px]"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(true)}
              className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'rgba(255,255,255,0.04)' }}>
              📁 Pick from library
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')}
                className="px-3 py-1.5 rounded-[6px] text-[12px]"
                style={{ color: '#f87171' }}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-[680px] max-h-[80vh] flex flex-col rounded-[14px] border overflow-hidden"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Select image</h3>
              <button type="button" onClick={() => setOpen(false)} style={{ color: 'var(--muted)' }}>✕</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
              {(['library', 'upload'] as const).map(t => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className="px-5 py-3 text-[13px] font-medium capitalize"
                  style={tab === t ? { color: 'var(--teal)', borderBottom: '2px solid var(--teal)' } : { color: 'var(--muted)' }}>
                  {t === 'library' ? 'Media library' : 'Upload new'}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'library' && (
                loading ? (
                  <p className="text-center text-[13px] py-8" style={{ color: 'var(--muted)' }}>Loading…</p>
                ) : media.length === 0 ? (
                  <p className="text-center text-[13px] py-8" style={{ color: 'var(--muted)' }}>No images in library yet. Upload one.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {media.map(m => (
                      <button key={m.id} type="button"
                        onClick={() => { onChange(m.url); setOpen(false) }}
                        className="group relative aspect-square rounded-[8px] overflow-hidden border transition-all duration-150 hover:border-[var(--teal)]"
                        style={{ borderColor: value === m.url ? 'var(--teal)' : 'var(--border)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.url} alt={m.alt ?? m.filename} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-end p-2 transition-opacity"
                          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                          <span className="text-[10px] text-white truncate w-full">{m.filename}</span>
                        </div>
                        {value === m.url && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            style={{ background: 'var(--teal)', color: '#031119' }}>✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}

              {tab === 'upload' && (
                <div
                  className="border-2 border-dashed rounded-[12px] p-10 flex flex-col items-center gap-4 text-center cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
                >
                  <div className="text-[32px]">🖼️</div>
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{uploading ? 'Uploading…' : 'Drag & drop or click to upload'}</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--muted)' }}>PNG, JPG, WebP, GIF — max 10 MB</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
