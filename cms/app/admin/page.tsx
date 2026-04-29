'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  published: boolean
  publishedAt: string | null
  createdAt?: string
}

interface Submission {
  id: string
  name: string
  email: string
  createdAt: string
}

interface Metrics {
  visitors: number | null
  topPage: string | null
  submissions: number | null
  openPRs: number | null
}

function MetricCard({ label, value, sub }: { label: string; value: string | number | null; sub?: string }) {
  return (
    <div
      className="rounded-[12px] border p-5 flex flex-col gap-1"
      style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}
    >
      <p className="text-[11px] uppercase tracking-[0.08em] font-medium" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-[28px] font-semibold tracking-tight leading-none" style={{ color: 'var(--text)' }}>
        {value === null ? '—' : value}
      </p>
      {sub && <p className="text-[12px] truncate" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({ visitors: null, topPage: null, submissions: null, openPRs: null })
  const [posts, setPosts] = useState<Post[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/analytics?days=7').then(r => r.ok ? r.json() : null),
      fetch('/api/github/pulls').then(r => r.ok ? r.json() : null),
      fetch('/api/posts').then(r => r.ok ? r.json() : null),
      fetch('/api/submissions?page=1').then(r => r.ok ? r.json() : null),
    ]).then(([analytics, pulls, postsRes, subsRes]) => {
      const analyticsData = analytics.status === 'fulfilled' ? analytics.value : null
      const pullsData = pulls.status === 'fulfilled' ? pulls.value : null
      const postsData = postsRes.status === 'fulfilled' ? postsRes.value : null
      const subsData = subsRes.status === 'fulfilled' ? subsRes.value : null

      let visitors: number | null = null
      let topPage: string | null = null
      if (analyticsData?.configured !== false && analyticsData) {
        const trendResults = analyticsData?.trend?.results
        if (Array.isArray(trendResults) && trendResults.length > 0) {
          const data = trendResults[0]?.data ?? []
          visitors = (data as number[]).reduce((a, b) => a + b, 0)
        }
        const topPages = analyticsData?.topPages?.results
        if (Array.isArray(topPages) && topPages.length > 0) {
          topPage = (topPages[0] as { label: string })?.label ?? null
        }
      }

      setMetrics({
        visitors,
        topPage,
        submissions: typeof subsData?.total === 'number' ? subsData.total : null,
        openPRs: Array.isArray(pullsData) ? pullsData.length : null,
      })

      if (Array.isArray(postsData?.posts)) {
        setPosts(postsData.posts.slice(0, 5))
      }
      if (Array.isArray(subsData?.submissions)) {
        setSubmissions(subsData.submissions.slice(0, 5))
      }

      setLoading(false)
    })
  }, [])

  function formatDate(iso: string | null | undefined) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--muted)' }}>Overview of your site activity.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard label="Visitors this week" value={loading ? '…' : metrics.visitors} />
        <MetricCard label="Top page" value={loading ? '…' : (metrics.topPage ?? '—')} />
        <MetricCard label="Form submissions" value={loading ? '…' : metrics.submissions} />
        <MetricCard label="Open PRs" value={loading ? '…' : metrics.openPRs} />
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent blog posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Recent blog posts</h2>
            <Link href="/admin/blog" className="text-[12px] no-underline" style={{ color: 'var(--teal)' }}>View all →</Link>
          </div>
          <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {loading ? (
              <div className="px-5 py-8 text-[13px] text-center" style={{ color: 'var(--muted)' }}>Loading…</div>
            ) : posts.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-center" style={{ color: 'var(--muted)' }}>No published posts yet.</div>
            ) : (
              posts.map((post, i) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{formatDate(post.publishedAt ?? post.createdAt)}</p>
                  </div>
                  <Link
                    href="/admin/blog"
                    className="text-[11px] px-2 py-1 rounded-[5px] no-underline flex-shrink-0"
                    style={{ color: 'var(--teal)', background: 'rgba(1,180,175,0.08)' }}
                  >
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent submissions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Recent submissions</h2>
          </div>
          <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {loading ? (
              <div className="px-5 py-8 text-[13px] text-center" style={{ color: 'var(--muted)' }}>Loading…</div>
            ) : submissions.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-center" style={{ color: 'var(--muted)' }}>No submissions yet.</div>
            ) : (
              submissions.map((sub, i) => (
                <div
                  key={sub.id}
                  className="px-4 py-3"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
                >
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{sub.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[12px]" style={{ color: 'var(--muted)' }}>{sub.email}</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{formatDate(sub.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
