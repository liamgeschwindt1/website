'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type PageRecord = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  published: boolean
  updatedAt: Date | string
}

type PostRecord = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  published: boolean
  updatedAt: Date | string
}

type Props = {
  pages: PageRecord[]
  posts: PostRecord[]
  footerContent: string
}

const PAGE_ORDER = ['home', 'for-business', 'partners', 'tiera', 'privacy', 'cookies']

function sortPages(pages: PageRecord[]) {
  return [...pages].sort((left, right) => {
    const leftIndex = PAGE_ORDER.indexOf(left.slug)
    const rightIndex = PAGE_ORDER.indexOf(right.slug)
    if (leftIndex === -1 && rightIndex === -1) return left.title.localeCompare(right.title)
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })
}

export default function ContentManager({ pages, posts, footerContent }: Props) {
  const orderedPages = useMemo(() => sortPages(pages), [pages])
  const [scope, setScope] = useState<'page' | 'post' | 'footer'>('page')
  const [selectedId, setSelectedId] = useState(orderedPages[0]?.id ?? posts[0]?.id ?? 'footer')
  const [draftPages, setDraftPages] = useState(() => Object.fromEntries(orderedPages.map((page) => [page.id, { title: page.title, slug: page.slug, excerpt: page.excerpt ?? '', content: page.content, published: page.published }])))
  const [draftPosts, setDraftPosts] = useState(() => Object.fromEntries(posts.map((post) => [post.id, { title: post.title, slug: post.slug, excerpt: post.excerpt ?? '', content: post.content, published: post.published }])))
  const [draftFooter, setDraftFooter] = useState(footerContent)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const activePage = orderedPages.find((page) => page.id === selectedId) ?? orderedPages[0]
  const activePost = posts.find((post) => post.id === selectedId) ?? posts[0]
  const pageDraft = activePage ? draftPages[activePage.id] : null
  const postDraft = activePost ? draftPosts[activePost.id] : null

  async function saveCurrent() {
    setSaving(true)
    setMessage('')
    try {
      if (scope === 'footer') {
        const res = await fetch('/api/content/footer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: draftFooter }),
        })
        if (!res.ok) throw new Error('Failed to save footer copy')
      } else if (scope === 'page' && activePage && pageDraft) {
        const res = await fetch(`/api/pages/${activePage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageDraft),
        })
        if (!res.ok) throw new Error('Failed to save page')
      } else if (scope === 'post' && activePost && postDraft) {
        const res = await fetch(`/api/posts/${activePost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postDraft),
        })
        if (!res.ok) throw new Error('Failed to save post')
      }
      setMessage('Saved')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="flex items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Content</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>Edit page copy directly, switch between website pages, and update the footer from one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/pages/new" className="text-[12px] font-medium no-underline" style={{ color: 'var(--teal)' }}>+ New page</Link>
          <Link href="/admin/posts/new" className="text-[12px] font-medium no-underline" style={{ color: 'var(--teal)' }}>+ New post</Link>
        </div>
      </div>

      <div className="rounded-[14px] border p-5 mb-6" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {(['page', 'post', 'footer'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setScope(option)
                if (option === 'page' && orderedPages[0]) setSelectedId(orderedPages[0].id)
                if (option === 'post' && posts[0]) setSelectedId(posts[0].id)
                if (option === 'footer') setSelectedId('footer')
              }}
              className="px-3 py-1.5 rounded-[7px] text-[12px] font-medium capitalize border"
              style={scope === option ? { color: 'var(--teal)', borderColor: 'var(--teal)', background: 'rgba(1,180,175,0.1)' } : { color: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              {option}
            </button>
          ))}

          {scope !== 'footer' && (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-3 py-2 rounded-[7px] text-[13px] border min-w-[240px]"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              {(scope === 'page' ? orderedPages : posts).map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.title}</option>
              ))}
            </select>
          )}

          <button type="button" onClick={saveCurrent} disabled={saving} className="ml-auto px-4 py-2 rounded-[7px] text-[13px] font-medium disabled:opacity-50" style={{ background: 'var(--teal)', color: '#031119' }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {message && (
          <div className="mb-4 text-[12px]" style={{ color: message === 'Saved' ? 'var(--teal)' : '#f87171' }}>
            {message}
          </div>
        )}

        {scope === 'footer' ? (
          <div>
            <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Footer copy</label>
            <textarea
              value={draftFooter}
              onChange={(e) => setDraftFooter(e.target.value)}
              rows={18}
              className="w-full px-4 py-3 rounded-[8px] border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--body)' }}
            />
          </div>
        ) : scope === 'page' && activePage && pageDraft ? (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Title</label>
                <input value={pageDraft.title} onChange={(e) => setDraftPages((prev) => ({ ...prev, [activePage.id]: { ...pageDraft, title: e.target.value } }))} className="w-full px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Slug</label>
                <input value={pageDraft.slug} onChange={(e) => setDraftPages((prev) => ({ ...prev, [activePage.id]: { ...pageDraft, slug: e.target.value } }))} className="w-full px-3 py-2 rounded-[7px] border font-mono" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Excerpt</label>
                <textarea value={pageDraft.excerpt} onChange={(e) => setDraftPages((prev) => ({ ...prev, [activePage.id]: { ...pageDraft, excerpt: e.target.value } }))} rows={4} className="w-full px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--body)' }} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Page content</label>
              <textarea value={pageDraft.content} onChange={(e) => setDraftPages((prev) => ({ ...prev, [activePage.id]: { ...pageDraft, content: e.target.value } }))} rows={24} className="w-full px-4 py-3 rounded-[8px] border bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--body)' }} />
            </div>
          </div>
        ) : scope === 'post' && activePost && postDraft ? (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Title</label>
                <input value={postDraft.title} onChange={(e) => setDraftPosts((prev) => ({ ...prev, [activePost.id]: { ...postDraft, title: e.target.value } }))} className="w-full px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Slug</label>
                <input value={postDraft.slug} onChange={(e) => setDraftPosts((prev) => ({ ...prev, [activePost.id]: { ...postDraft, slug: e.target.value } }))} className="w-full px-3 py-2 rounded-[7px] border font-mono" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Excerpt</label>
                <textarea value={postDraft.excerpt} onChange={(e) => setDraftPosts((prev) => ({ ...prev, [activePost.id]: { ...postDraft, excerpt: e.target.value } }))} rows={4} className="w-full px-3 py-2 rounded-[7px] border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--body)' }} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide mb-2 font-medium" style={{ color: 'var(--muted)' }}>Post content</label>
              <textarea value={postDraft.content} onChange={(e) => setDraftPosts((prev) => ({ ...prev, [activePost.id]: { ...postDraft, content: e.target.value } }))} rows={24} className="w-full px-4 py-3 rounded-[8px] border bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--body)' }} />
            </div>
          </div>
        ) : (
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Nothing to edit yet.</p>
        )}
      </div>
    </div>
  )
}