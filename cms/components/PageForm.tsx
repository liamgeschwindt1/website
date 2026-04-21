'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImagePicker from '@/components/ImagePicker'

interface Page {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  seoTitle: string | null
  seoDesc: string | null
  published: boolean
}

interface Props {
  mode: 'new' | 'edit'
  page?: Page
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function PageForm({ mode, page }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [content, setContent] = useState(page?.content ?? '')
  const [excerpt, setExcerpt] = useState(page?.excerpt ?? '')
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? '')
  const [seoDesc, setSeoDesc] = useState(page?.seoDesc ?? '')
  const [published, setPublished] = useState(page?.published ?? false)
  const [coverImage, setCoverImage] = useState('')
  const [tab, setTab] = useState<'content' | 'seo'>('content')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(val: string) {
    setTitle(val)
    if (mode === 'new') setSlug(slugify(val))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = mode === 'new' ? '/api/pages' : `/api/pages/${page!.id}`
      const res = await fetch(url, {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, excerpt, coverImage, seoTitle, seoDesc, published }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed'); return }
      router.push('/admin/pages')
      router.refresh()
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this page? Cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/pages/${page!.id}`, { method: 'DELETE' })
    router.push('/admin/pages')
    router.refresh()
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-[7px] text-[14px] border transition-colors duration-150 focus:outline-none'
  const inputStyle = { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 h-14 border-b sticky top-0 z-10 flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'rgba(3,17,25,0.97)' }}>
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="text-[13px] no-underline" style={{ color: 'var(--muted)' }}>← Pages</Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>{mode === 'new' ? 'New page' : 'Edit page'}</span>
        </div>
        <div className="flex items-center gap-3">
          {mode === 'edit' && (
            <button type="button" onClick={handleDelete} disabled={deleting} className="text-[13px] disabled:opacity-50" style={{ color: '#f87171' }}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[13px]" style={{ color: 'var(--muted)' }}>{published ? 'Published' : 'Draft'}</span>
            <div
              className="relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer"
              style={{ background: published ? 'var(--teal)' : 'rgba(255,255,255,0.15)' }}
              onClick={() => setPublished(p => !p)}
            >
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                style={{ left: published ? '18px' : '2px' }} />
            </div>
          </label>
          <button type="submit" form="page-form" disabled={loading}
            className="px-4 py-1.5 rounded-[6px] text-[13px] font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: 'var(--teal)', color: '#031119' }}>
            {loading ? 'Saving…' : mode === 'new' ? 'Create page' : 'Save changes'}
          </button>
        </div>
      </header>

      <form id="page-form" onSubmit={handleSubmit} className="flex-1 px-8 py-8 max-w-4xl">
        {error && <p className="mb-4 text-[13px] px-4 py-3 rounded-[6px] bg-red-900/20 border border-red-800/40" style={{ color: '#f87171' }}>{error}</p>}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-[8px] w-fit" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['content', 'seo'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-[6px] text-[13px] font-medium capitalize transition-colors duration-150"
              style={tab === t ? { background: 'var(--teal)', color: '#031119' } : { color: 'var(--muted)' }}>
              {t === 'seo' ? 'SEO' : 'Content'}
            </button>
          ))}
        </div>

        {tab === 'content' && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Title *</label>
              <input className={inputClass} style={inputStyle} value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Page title" required />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Slug *</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)' }}>
                <span className="text-[13px]" style={{ color: 'var(--muted)' }}>touchpulse.nl/</span>
                <input className="flex-1 bg-transparent text-[14px] focus:outline-none" style={{ color: 'var(--text)' }} value={slug} onChange={e => setSlug(e.target.value)} placeholder="page-slug" required />
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Excerpt</label>
              <textarea className={inputClass} style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short description shown in listings…" />
            </div>
            <ImagePicker value={coverImage} onChange={setCoverImage} />
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Content *</label>
              <textarea
                className={`${inputClass} prose-editor`}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '400px' }}
                rows={20}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your page content here (Markdown supported)…"
                required
              />
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="flex flex-col gap-5 max-w-2xl">
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>SEO Title</label>
              <input className={inputClass} style={inputStyle} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Defaults to page title if empty" />
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>{seoTitle.length}/60 characters recommended</p>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Meta Description</label>
              <textarea className={inputClass} style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Describe this page for search engines…" />
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>{seoDesc.length}/160 characters recommended</p>
            </div>
            <div className="rounded-[10px] p-4 border" style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[11px] uppercase tracking-wide mb-3 font-medium" style={{ color: 'var(--muted)' }}>Preview</p>
              <p className="text-[16px] font-medium" style={{ color: '#4a90d9' }}>{seoTitle || title || 'Page title'}</p>
              <p className="text-[12px]" style={{ color: '#4fa854' }}>touchpulse.nl/{slug || 'page-slug'}</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--body)' }}>{seoDesc || excerpt || 'No description set.'}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
