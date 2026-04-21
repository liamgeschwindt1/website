import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/AdminHeader'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, slug: true, published: true, updatedAt: true },
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
              Blog posts
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>
              {posts.length} total · {posts.filter((p) => p.published).length} published
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-[6px] px-4 py-2 rounded-[6px] text-[13px] font-medium no-underline transition-opacity duration-150 hover:opacity-90"
            style={{ background: 'var(--teal)', color: '#031119' }}
          >
            + New post
          </Link>
        </div>

        {/* Posts table */}
        <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {posts.length === 0 ? (
            <div className="py-16 text-center" style={{ color: 'var(--muted)' }}>
              <p className="text-[15px]">No posts yet.</p>
              <Link href="/admin/posts/new" className="text-[13px] mt-2 inline-block" style={{ color: 'var(--teal)' }}>
                Create your first post →
              </Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(27,53,79,0.35)' }}>
                  <th className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>Title</th>
                  <th className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>Slug</th>
                  <th className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--muted)' }}>Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr
                    key={post.id}
                    style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
                  >
                    <td className="px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                      {post.title}
                    </td>
                    <td className="px-5 py-4 text-[13px] font-mono" style={{ color: 'var(--muted)' }}>
                      /{post.slug}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                        style={
                          post.published
                            ? { color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.35)', background: 'rgba(1,180,175,0.08)' }
                            : { color: 'var(--muted)', borderColor: 'var(--border)', background: 'transparent' }
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: post.published ? 'var(--teal)' : 'var(--muted)' }} />
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px]" style={{ color: 'var(--muted)' }}>
                      {new Date(post.updatedAt).toLocaleDateString('en-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-[13px] no-underline hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--teal)' }}
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
