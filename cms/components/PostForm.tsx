'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  published: boolean
}

interface Props {
  mode: 'new' | 'edit'
  post?: Post
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function PostForm({ mode, post }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (mode === 'new') setSlug(slugify(val))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = mode === 'new' ? '/api/posts' : `/api/posts/${post!.id}`
      const method = mode === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, excerpt, content, coverImage, published }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch(`/api/posts/${post!.id}`, { method: 'DELETE' })
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Failed to delete.')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 h-14 border-b sticky top-0 z-10"
        style={{ borderColor: 'var(--border)', background: 'rgba(3,17,25,0.97)' }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-[13px] no-underline transition-colors duration-150"
            style={{ color: 'var(--muted)' }}
          >
            ← Posts
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
            {mode === 'new' ? 'New post' : 'Edit post'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-[13px] transition-colors duration-150 disabled:opacity-50"
              style={{ color: '#f87171' }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            form="post-form"
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-[6px] text-[13px] font-medium transition-opacity duration-150 disabled:opacity-60"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            {loading ? 'Saving…' : published ? 'Save & publish' : 'Save draft'}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-[8px] border text-[13px]"
            style={{ borderColor: 'rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        <form id="post-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--muted)' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="Post title"
              className="w-full px-4 py-3 rounded-[8px] border bg-transparent text-[18px] font-medium transition-colors duration-150"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--muted)' }}>
              Slug *
            </label>
            <div
              className="flex items-center rounded-[8px] border overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="px-3 py-2.5 text-[13px] border-r" style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'rgba(27,53,79,0.3)' }}>
                /blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="my-post-slug"
                className="flex-1 px-3 py-2.5 bg-transparent text-[14px] font-mono"
                style={{ color: 'var(--text)' }}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--muted)' }}>
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Brief summary shown in post listings…"
              className="w-full px-4 py-3 rounded-[8px] border bg-transparent text-[14px] resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--body)' }}
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--muted)' }}>
              Cover image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-2.5 rounded-[8px] border bg-transparent text-[14px]"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--muted)' }}>
              Content * <span className="font-normal">(Markdown)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={24}
              placeholder="# Heading&#10;&#10;Write your post in Markdown…"
              className="prose-editor w-full px-4 py-3 rounded-[8px] border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--body)' }}
            />
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              className="relative w-10 h-5 rounded-full transition-colors duration-200"
              style={{ background: published ? 'var(--teal)' : 'rgba(255,255,255,0.15)' }}
            >
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="sr-only"
              />
              <div
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                style={{ transform: published ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </div>
            <span className="text-[14px]" style={{ color: 'var(--body)' }}>
              {published ? 'Published' : 'Draft — not publicly visible'}
            </span>
          </label>
        </form>
      </div>
    </div>
  )
}
