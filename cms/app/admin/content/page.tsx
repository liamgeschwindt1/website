import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  const [pages, posts] = await Promise.all([
    prisma.page.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.post.findMany({ orderBy: { updatedAt: 'desc' } }),
  ])

  return (
    <div className="px-8 py-8 max-w-[860px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Content</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>Manage text across pages and blog posts.</p>
      </div>

      {/* Pages */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>Pages</h2>
          <Link
            href="/admin/pages/new"
            className="text-[12px] font-medium no-underline"
            style={{ color: 'var(--teal)' }}
          >
            + New page
          </Link>
        </div>
        <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {pages.length === 0 ? (
            <div className="py-10 text-center" style={{ color: 'var(--muted)' }}>
              <p className="text-[14px]">No pages yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(27,53,79,0.35)' }}>
                  {['Title', 'Slug', 'Status', 'Updated', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map((page, i) => (
                  <tr key={page.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <td className="px-5 py-3 text-[14px] font-medium" style={{ color: 'var(--text)' }}>{page.title}</td>
                    <td className="px-5 py-3 text-[13px] font-mono" style={{ color: 'var(--muted)' }}>/{page.slug}</td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                        style={page.published
                          ? { color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.35)', background: 'rgba(1,180,175,0.08)' }
                          : { color: 'var(--muted)', borderColor: 'var(--border)', background: 'transparent' }}>
                        {page.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px]" style={{ color: 'var(--muted)' }}>
                      {new Date(page.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/pages/${page.id}`} className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Blog Posts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>Blog Posts</h2>
          <Link
            href="/admin/posts/new"
            className="text-[12px] font-medium no-underline"
            style={{ color: 'var(--teal)' }}
          >
            + New post
          </Link>
        </div>
        <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {posts.length === 0 ? (
            <div className="py-10 text-center" style={{ color: 'var(--muted)' }}>
              <p className="text-[14px]">No posts yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(27,53,79,0.35)' }}>
                  {['Title', 'Slug', 'Status', 'Updated', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr key={post.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <td className="px-5 py-3 text-[14px] font-medium" style={{ color: 'var(--text)' }}>{post.title}</td>
                    <td className="px-5 py-3 text-[13px] font-mono" style={{ color: 'var(--muted)' }}>/{post.slug}</td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                        style={post.published
                          ? { color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.35)', background: 'rgba(1,180,175,0.08)' }
                          : { color: 'var(--muted)', borderColor: 'var(--border)', background: 'transparent' }}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px]" style={{ color: 'var(--muted)' }}>
                      {new Date(post.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/posts/${post.id}`} className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
