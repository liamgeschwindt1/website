import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PagesListPage() {
  let pages
  try {
    pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database error'
    throw new Error(`Failed to load pages. Check DATABASE_URL is set on Railway. (${msg})`)
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Pages</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>
            {pages.length} total · {pages.filter(p => p.published).length} published
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium no-underline hover:opacity-90 transition-opacity"
          style={{ background: 'var(--teal)', color: '#031119' }}
        >
          + New page
        </Link>
      </div>

      <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        {pages.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--muted)' }}>
            <p className="text-[15px]">No pages yet.</p>
            <Link href="/admin/pages/new" className="text-[13px] mt-2 inline-block" style={{ color: 'var(--teal)' }}>
              Create your first page →
            </Link>
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
                  <td className="px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--text)' }}>{page.title}</td>
                  <td className="px-5 py-4 text-[13px] font-mono" style={{ color: 'var(--muted)' }}>/{page.slug}</td>
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                      style={page.published
                        ? { color: 'var(--teal)', borderColor: 'rgba(1,180,175,0.35)', background: 'rgba(1,180,175,0.08)' }
                        : { color: 'var(--muted)', borderColor: 'var(--border)', background: 'transparent' }
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: page.published ? 'var(--teal)' : 'var(--muted)' }} />
                      {page.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px]" style={{ color: 'var(--muted)' }}>
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="text-[12px] no-underline transition-colors duration-150"
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
  )
}
