'use client'

import { useState, useRef, useCallback, DragEvent } from 'react'
import { slugify } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
}

interface Props {
  initialPosts: Post[]
}

const BLANK_POST: Omit<Post, 'id' | 'createdAt' | 'publishedAt'> = {
  title: '',
  slug: '',
  content: '',
  excerpt: null,
  coverImage: null,
  published: false,
}

export default function BlogClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [selected, setSelected] = useState<Post | null>(null)
  const [isNew, setIsNew] = useState(false)

  // Editor state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  function selectPost(post: Post) {
    setSelected(post)
    setIsNew(false)
    setTitle(post.title)
    setBody(post.content)
    setCoverImage(post.coverImage)
    setPublished(post.published)
    setSaveMsg('')
  }

  function newPost() {
    setSelected(null)
    setIsNew(true)
    setTitle('')
    setBody('')
    setCoverImage(null)
    setPublished(false)
    setSaveMsg('')
  }

  function insertMarkdown(prefix: string, suffix = prefix) {
    const ta = document.querySelector<HTMLTextAreaElement>('#blog-body')
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = body.slice(start, end)
    const newBody = body.slice(0, start) + prefix + sel + suffix + body.slice(end)
    setBody(newBody)
    setTimeout(() => {
      ta.setSelectionRange(start + prefix.length, end + prefix.length)
      ta.focus()
    }, 0)
  }

  async function uploadCover(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: form })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setCoverImage(data.url ?? null)
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadCover(file)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveDraft() {
    await save(false)
  }

  async function publish() {
    await save(true)
  }

  async function save(pub: boolean) {
    if (!title.trim()) { setSaveMsg('Title is required.'); return }
    setSaving(true)
    setSaveMsg('')
    try {
      const slug = selected?.slug ?? slugify(title)
      const payload = {
        title: title.trim(),
        slug,
        content: body,
        excerpt: body.slice(0, 160) || null,
        coverImage: coverImage || null,
        published: pub,
      }

      if (isNew) {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json() as { post?: Post; error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Failed to create')
        const newPost = data.post!
        setPosts(prev => [newPost, ...prev])
        setSelected(newPost)
        setIsNew(false)
        setPublished(pub)
        setSaveMsg(pub ? '✓ Published' : '✓ Draft saved')
      } else if (selected) {
        const res = await fetch(`/api/posts/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json() as { post?: Post; error?: string }
        if (!res.ok) throw new Error(data.error ?? 'Failed to save')
        const updated = data.post!
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
        setSelected(updated)
        setPublished(pub)
        setSaveMsg(pub ? '✓ Published' : '✓ Draft saved')
      }
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function deletePost() {
    if (!selected || !confirm('Delete this post permanently?')) return
    try {
      await fetch(`/api/posts/${selected.id}`, { method: 'DELETE' })
      setPosts(prev => prev.filter(p => p.id !== selected.id))
      setSelected(null)
      setIsNew(false)
    } catch {
      setSaveMsg('Delete failed.')
    }
  }

  function formatDate(iso: string | null | undefined) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const hasEditor = isNew || selected !== null

  return (
    <div style={{ display: 'flex', height: 'calc(100vh)', overflow: 'hidden' }}>
      {/* Left — post list */}
      <div
        className="flex-shrink-0 border-r overflow-y-auto"
        style={{ width: '35%', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--border)', background: 'rgba(3,12,19,0.97)' }}>
          <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>Blog</h1>
          <button
            type="button"
            onClick={newPost}
            className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            + New post
          </button>
        </div>

        {posts.length === 0 && !isNew ? (
          <div className="px-5 py-12 text-center text-[13px]" style={{ color: 'var(--muted)' }}>
            No posts yet. Create your first one.
          </div>
        ) : (
          <ul>
            {isNew && (
              <li
                className="flex items-center gap-3 px-5 py-3 border-b cursor-pointer"
                style={{ borderColor: 'var(--border)', background: 'rgba(1,180,175,0.08)', borderLeft: '3px solid var(--teal)' }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--muted)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{title || 'Untitled post'}</p>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Draft</p>
                </div>
              </li>
            )}
            {posts.map(post => (
              <li
                key={post.id}
                onClick={() => selectPost(post)}
                className="flex items-center gap-3 px-5 py-3 border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  background: selected?.id === post.id ? 'rgba(1,180,175,0.06)' : 'transparent',
                  borderLeft: selected?.id === post.id ? '3px solid var(--teal)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (selected?.id !== post.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if (selected?.id !== post.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: post.published ? 'var(--teal)' : 'var(--muted)' }}
                  title={post.published ? 'Published' : 'Draft'}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    {post.published ? formatDate(post.publishedAt) : 'Draft'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right — editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!hasEditor ? (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted)' }}>
            <p className="text-[13px]">Select a post or create a new one.</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-8 py-6">
            {/* Title */}
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Post title."
              className="w-full bg-transparent border-none outline-none text-[26px] font-semibold tracking-tight mb-6"
              style={{ color: 'var(--text)', caretColor: 'var(--teal)' }}
            />

            {/* Body */}
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => insertMarkdown('**')} className="px-2 py-1 rounded text-[12px] font-bold border" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}>B</button>
                <button type="button" onClick={() => insertMarkdown('_')} className="px-2 py-1 rounded text-[12px] italic border" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}>I</button>
                <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="px-2 py-1 rounded text-[12px] border" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}>Link</button>
              </div>
              <textarea
                id="blog-body"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your post in markdown…"
                rows={18}
                className="w-full px-4 py-3 rounded-[8px] border text-[14px] leading-[1.8] resize-none font-mono"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--text)', caretColor: 'var(--teal)' }}
              />
            </div>

            {/* Cover image */}
            <div className="mb-6">
              <p className="text-[12px] font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--muted)' }}>Cover image</p>
              {coverImage ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="Cover" className="rounded-[8px] max-h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[12px]"
                    style={{ background: 'rgba(248,113,113,0.9)', color: '#fff' }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="rounded-[10px] border-2 border-dashed flex items-center justify-center py-8 text-[13px] cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? 'var(--teal)' : 'rgba(255,255,255,0.12)',
                    background: dragOver ? 'rgba(1,180,175,0.05)' : 'transparent',
                    color: dragOver ? 'var(--teal)' : 'var(--muted)',
                  }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {uploading ? 'Uploading…' : 'Drop image or click to upload'}
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="accent-[var(--teal)]"
                />
                <span className="text-[13px]" style={{ color: 'var(--text)' }}>Published</span>
              </label>

              <div className="flex-1" />

              {selected && !isNew && (
                <button
                  type="button"
                  onClick={deletePost}
                  className="text-[12px]"
                  style={{ color: '#f87171' }}
                >
                  Delete
                </button>
              )}

              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="px-4 py-2 rounded-[7px] text-[13px] font-medium border disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'transparent' }}
              >
                {saving ? 'Saving…' : 'Save draft'}
              </button>

              <button
                type="button"
                onClick={publish}
                disabled={saving}
                className="px-4 py-2 rounded-[7px] text-[13px] font-medium disabled:opacity-50"
                style={{ background: 'var(--teal)', color: '#031119' }}
              >
                {saving ? 'Saving…' : 'Publish'}
              </button>
            </div>

            {saveMsg && (
              <p className="mt-3 text-[12px]" style={{ color: saveMsg.startsWith('✓') ? 'var(--teal)' : '#f87171' }}>
                {saveMsg}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
