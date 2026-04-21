'use client'

import { useState, useEffect, useCallback } from 'react'

type Days = 7 | 30 | 90

interface TrendSeries {
  label: string
  data: number[]
  labels: string[]
}

interface BreakdownItem {
  label: string
  count: number
}

interface AnalyticsData {
  configured: boolean
  error?: string
  days?: number
  trend?: {
    results?: Array<{ label: string; data: number[]; days: string[] }>
  }
  topReferrers?: { results?: Array<{ label: string; data: number[] }> }
  topCountries?: { results?: Array<{ label: string; data: number[] }> }
  topBrowsers?: { results?: Array<{ label: string; data: number[] }> }
  topDevices?: { results?: Array<{ label: string; data: number[] }> }
}

function sumSeries(results: Array<{ data: number[] }> | undefined): number {
  if (!results?.length) return 0
  return (results[0].data ?? []).reduce((a: number, b: number) => a + b, 0)
}

function topItems(results: Array<{ label: string; data: number[] }> | undefined, max = 5): BreakdownItem[] {
  if (!results) return []
  return results
    .map(r => ({ label: r.label ?? 'Unknown', count: (r.data ?? []).reduce((a: number, b: number) => a + b, 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, max)
}

function MiniBar({ items }: { items: BreakdownItem[] }) {
  const max = Math.max(...items.map(i => i.count), 1)
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="text-[12px] w-[120px] truncate flex-shrink-0" style={{ color: 'var(--muted)' }}>{item.label || '(direct)'}</div>
          <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: `${(item.count / max) * 100}%`, background: 'var(--teal)' }} />
          </div>
          <div className="text-[12px] w-8 text-right flex-shrink-0" style={{ color: 'var(--text)' }}>{item.count}</div>
        </div>
      ))}
    </div>
  )
}

function TrendChart({ series, labels }: { series: TrendSeries[]; labels: string[] }) {
  const allValues = series.flatMap(s => s.data)
  const max = Math.max(...allValues, 1)
  const steps = 6
  const H = 120
  const W = labels.length

  return (
    <div className="relative" style={{ height: H + 24 }}>
      {/* Y axis guides */}
      {Array.from({ length: steps }).map((_, i) => (
        <div key={i} className="absolute left-0 right-0" style={{ bottom: 24 + (i / (steps - 1)) * H, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
      ))}
      {/* SVG chart */}
      <svg width="100%" height={H} style={{ position: 'absolute', top: 0 }} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {series.map((s, si) => {
          const color = si === 0 ? '#01b4af' : '#94b8ff'
          const pts = s.data.map((v, i) => `${i},${H - (v / max) * H}`).join(' ')
          const fill = `${s.data.map((v, i) => `${i},${H - (v / max) * H}`).join(' ')} ${W - 1},${H} 0,${H}`
          return (
            <g key={s.label}>
              <polygon points={fill} fill={color} opacity={0.08} />
              <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
            </g>
          )
        })}
      </svg>
      {/* X axis labels — show first, mid, last only */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px]" style={{ color: 'var(--muted)' }}>
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [days, setDays] = useState<Days>(30)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (d: Days) => {
    setLoading(true)
    const res = await fetch(`/api/analytics?days=${d}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load(days) }, [load, days])

  const trendResults = data?.trend?.results ?? []
  const pageviews = sumSeries(trendResults.filter(r => r.label === 'Pageviews'))
  const sessions = sumSeries(trendResults.filter(r => r.label === 'Sessions'))
  const labels = trendResults[0]?.days ?? []

  const pvSeries: TrendSeries = { label: 'Pageviews', data: trendResults.find(r => r.label === 'Pageviews')?.data ?? [], labels }
  const seSeries: TrendSeries = { label: 'Sessions', data: trendResults.find(r => r.label === 'Sessions')?.data ?? [], labels }

  if (!data?.configured && !loading) {
    return (
      <div className="px-8 py-8">
        <h1 className="text-[24px] font-semibold mb-2" style={{ color: 'var(--text)' }}>Analytics</h1>
        <div className="mt-8 max-w-[560px] p-8 rounded-[14px] border" style={{ borderColor: 'rgba(1,180,175,0.3)', background: 'rgba(1,180,175,0.05)' }}>
          <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--teal)' }}>PostHog not yet configured</p>
          <p className="text-[13px] leading-[1.7] mb-6" style={{ color: 'var(--muted)' }}>
            Analytics is powered by PostHog EU (GDPR-compliant, EU data residency). Create a free account at{' '}
            <a href="https://eu.posthog.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--teal)' }}>eu.posthog.com</a>
            {' '}then add these environment variables to the CMS Railway service:
          </p>
          <div className="flex flex-col gap-2">
            {[
              ['POSTHOG_PROJECT_ID', 'Your project numeric ID (Settings → Project)'],
              ['POSTHOG_PERSONAL_API_KEY', 'Personal API key (Settings → Personal API Keys)'],
              ['POSTHOG_HOST', 'https://eu.posthog.com (default)'],
            ].map(([key, desc]) => (
              <div key={key} className="p-3 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <code className="text-[12px] font-mono" style={{ color: 'var(--teal)' }}>{key}</code>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] mt-5" style={{ color: 'var(--muted)' }}>
            The tracking script on the website uses <code className="px-1" style={{ background: 'rgba(255,255,255,0.07)' }}>NEXT_PUBLIC_POSTHOG_KEY</code> — set that on the touchpulse Railway service.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold" style={{ color: 'var(--text)' }}>Analytics</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>Site traffic — touchpulse-production.up.railway.app</p>
        </div>
        <div className="flex gap-1">
          {([7, 30, 90] as Days[]).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => { setDays(d); load(d) }}
              className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium border transition-all"
              style={{
                borderColor: days === d ? 'var(--teal)' : 'var(--border)',
                color: days === d ? 'var(--teal)' : 'var(--muted)',
                background: days === d ? 'rgba(1,180,175,0.1)' : 'transparent',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {data?.error && (
        <div className="mb-6 p-4 rounded-[10px] text-[13px]" style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
          {data.error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pageviews', value: loading ? '…' : pageviews.toLocaleString() },
          { label: 'Sessions', value: loading ? '…' : sessions.toLocaleString() },
          { label: 'Unique visitors', value: loading ? '…' : '—' },
          { label: 'Avg. session', value: '—' },
        ].map(card => (
          <div key={card.label} className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.18)' }}>
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-2" style={{ color: 'var(--muted)' }}>{card.label}</div>
            <div className="text-[28px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>{card.value}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>last {days} days</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="p-6 rounded-[14px] border mb-6" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.12)' }}>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Traffic over time</h2>
          <div className="flex gap-3 ml-auto">
            {[pvSeries, seSeries].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
                <div className="w-3 h-[2px] rounded-full" style={{ background: s.label === 'Pageviews' ? 'var(--teal)' : '#94b8ff' }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-[144px] flex items-center justify-center text-[13px]" style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : pvSeries.data.length > 0 ? (
          <TrendChart series={[pvSeries, seSeries]} labels={labels} />
        ) : (
          <div className="h-[144px] flex items-center justify-center text-[13px]" style={{ color: 'var(--muted)' }}>No data</div>
        )}
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Top referrers', items: topItems(data?.topReferrers?.results) },
          { title: 'Top countries', items: topItems(data?.topCountries?.results) },
          { title: 'Browsers', items: topItems(data?.topBrowsers?.results) },
          { title: 'Device types', items: topItems(data?.topDevices?.results) },
        ].map(panel => (
          <div key={panel.title} className="p-5 rounded-[12px] border" style={{ borderColor: 'var(--border)', background: 'rgba(27,53,79,0.12)' }}>
            <h3 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--text)' }}>{panel.title}</h3>
            {loading ? (
              <div className="text-[12px]" style={{ color: 'var(--muted)' }}>Loading…</div>
            ) : panel.items.length > 0 ? (
              <MiniBar items={panel.items} />
            ) : (
              <div className="text-[12px]" style={{ color: 'var(--muted)' }}>No data</div>
            )}
          </div>
        ))}

        {/* PostHog app link */}
        <div className="p-5 rounded-[12px] border flex flex-col justify-between" style={{ borderColor: 'rgba(1,180,175,0.2)', background: 'rgba(1,180,175,0.04)' }}>
          <div>
            <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--teal)' }}>Full PostHog dashboard</p>
            <p className="text-[12px] leading-[1.6]" style={{ color: 'var(--muted)' }}>Session recordings, heatmaps, funnels, and more available in PostHog directly.</p>
          </div>
          <a
            href="https://eu.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium no-underline"
            style={{ color: 'var(--teal)' }}
          >
            Open PostHog ↗
          </a>
        </div>
      </div>
    </div>
  )
}
