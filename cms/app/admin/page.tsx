import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  let posts: { id: string; title: string; slug: string; published: boolean; updatedAt: Date }[] = []
  let pages: typeof posts = []
  let mediaCount = 0

  try {
    ;[posts, pages, mediaCount] = await Promise.all([
      prisma.post.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, slug: true, published: true, updatedAt: true } }),
      prisma.page.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, slug: true, published: true, updatedAt: true } }),
      prisma.media.count(),
    ])
  } catch {
    // DB may be unavailable — render gracefully with empty data
  }

  const stats = [
    { label: 'Blog Posts', value: posts.length, sub: `${posts.filter(p => p.published).length} published`, href: '/admin/posts', color: 'var(--teal)' },
    { label: 'Pages', value: pages.length, sub: `${pages.filter(p => p.published).length} published`, href: '/admin/pages', color: '#94b8ff' },
    { label: 'Media Files', value: mediaCount, sub: 'in library', href: '/admin/media', color: 'var(--gold)' },
  ]

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="no-underline block p-6 rounded-[12px] border transition-all duration-150 hover:border-[rgba(255,255,255,0.18)]"
            style={{ background: 'rgba(27,53,79,0.25)', borderColor: 'var(--border)' }}>
            <p className="text-[12px] font-medium uppercase tracking-wide mb-2" style={{ color: s.color }}>{s.label}</p>
            <p className="text-[36px] font-semibold leading-none mb-1" style={{ color: 'var(--text)' }}>{s.value}</p>
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 mb-10">
        {[
          { label: '+ New post', href: '/admin/posts/new', primary: true },
          { label: '+ New page', href: '/admin/pages/new', primary: false },
          { label: '↑ Upload media', href: '/admin/media', primary: false },
          { label: '⊙ Annotate site', href: '/admin/site', primary: false },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className="inline-flex items-center px-4 py-2 rounded-[6px] text-[13px] font-medium no-underline transition-opacity hover:opacity-90"
            style={a.primary ? { background: 'var(--teal)', color: '#031119' } : { border: '1px solid var(--border)', color: 'var(--text)', background: 'transparent' }}>
            {a.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Recent Posts</h2>
            <Link href="/admin/posts" className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>View all →</Link>
          </div>
          <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {posts.length === 0 ? (
              <div className="py-8 text-center text-[13px]" style={{ color: 'var(--muted)' }}>No posts yet</div>
            ) : posts.map((post, i) => (
              <div key={post.id} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{post.title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{new Date(post.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-full border"
                    style={post.published ? { color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.35)', background: 'rgba(1,180,175,0.08)' } : { color: 'var(--muted)', borderColor: 'var(--border)' }}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <Link href={`/admin/posts/${post.id}`} className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>Edit →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Recent Pages</h2>
            <Link href="/admin/pages" className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>View all →</Link>
          </div>
          <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {pages.length === 0 ? (
              <div className="py-8 text-center text-[13px]" style={{ color: 'var(--muted)' }}>No pages yet</div>
            ) : pages.map((page, i) => (
              <div key={page.id} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{page.title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>/{page.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-full border"
                    style={page.published ? { color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.35)', background: 'rgba(1,180,175,0.08)' } : { color: 'var(--muted)', borderColor: 'var(--border)' }}>
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                  <Link href={`/admin/pages/${page.id}`} className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>Edit →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
