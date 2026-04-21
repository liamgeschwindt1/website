import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const POSTHOG_HOST = process.env.POSTHOG_HOST ?? 'https://eu.posthog.com'
const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY ?? ''
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID ?? ''

async function phFetch(path: string) {
  const res = await fetch(`${POSTHOG_HOST}${path}`, {
    headers: { Authorization: `Bearer ${POSTHOG_API_KEY}` },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`PostHog ${res.status}`)
  return res.json()
}

async function phQuery(query: object) {
  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${POSTHOG_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`PostHog query ${res.status}`)
  return res.json()
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    return NextResponse.json({ configured: false })
  }

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') ?? '30', 10)
    const dateFrom = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]

    // Parallel fetch
    const [
      trendData,
      uniqueVisitors,
      topPages,
      topReferrers,
      topCountries,
      topBrowsers,
      topDevices,
      sectionViews,
      scrollDepth,
      formFunnel,
    ] = await Promise.all([
      // Daily pageviews + sessions
      phQuery({
        kind: 'TrendsQuery',
        series: [
          { kind: 'EventsNode', event: '$pageview', name: 'Pageviews', math: 'total' },
          { kind: 'EventsNode', event: '$pageview', name: 'Sessions', math: 'unique_session' },
        ],
        dateRange: { date_from: dateFrom },
        interval: 'day',
      }),

      // Unique visitors (HogQL)
      phQuery({
        kind: 'HogQLQuery',
        query: `SELECT uniq(distinct_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp >= '${dateFrom}'`,
      }).catch(() => null),

      // Top pages
      phFetch(`/api/projects/${POSTHOG_PROJECT_ID}/insights/?insight=PATHS&date_from=-${days}d&limit=10`).catch(() =>
        phQuery({
          kind: 'TrendsQuery',
          series: [{ kind: 'EventsNode', event: '$pageview', name: 'Views', math: 'total', properties: [] }],
          breakdownFilter: { breakdown: '$current_url', breakdown_type: 'event' },
          dateRange: { date_from: dateFrom },
        }),
      ),

      // Top referrers
      phQuery({
        kind: 'TrendsQuery',
        series: [{ kind: 'EventsNode', event: '$pageview', name: 'Sessions', math: 'unique_session' }],
        breakdownFilter: { breakdown: '$referring_domain', breakdown_type: 'event' },
        dateRange: { date_from: dateFrom },
      }),

      // Top countries
      phQuery({
        kind: 'TrendsQuery',
        series: [{ kind: 'EventsNode', event: '$pageview', name: 'Visitors', math: 'dau' }],
        breakdownFilter: { breakdown: '$geoip_country_name', breakdown_type: 'person' },
        dateRange: { date_from: dateFrom },
      }),

      // Top browsers
      phQuery({
        kind: 'TrendsQuery',
        series: [{ kind: 'EventsNode', event: '$pageview', name: 'Visitors', math: 'dau' }],
        breakdownFilter: { breakdown: '$browser', breakdown_type: 'event' },
        dateRange: { date_from: dateFrom },
      }),

      // Device types
      phQuery({
        kind: 'TrendsQuery',
        series: [{ kind: 'EventsNode', event: '$pageview', name: 'Visitors', math: 'dau' }],
        breakdownFilter: { breakdown: '$device_type', breakdown_type: 'event' },
        dateRange: { date_from: dateFrom },
      }),

      // Section views breakdown
      phQuery({
        kind: 'TrendsQuery',
        series: [{ kind: 'EventsNode', event: 'section_view', name: 'Views', math: 'total' }],
        breakdownFilter: { breakdown: 'section', breakdown_type: 'event' },
        dateRange: { date_from: dateFrom },
      }).catch(() => null),

      // Scroll depth breakdown
      phQuery({
        kind: 'TrendsQuery',
        series: [{ kind: 'EventsNode', event: 'scroll_depth', name: 'Count', math: 'total' }],
        breakdownFilter: { breakdown: 'depth_pct', breakdown_type: 'event' },
        dateRange: { date_from: dateFrom },
      }).catch(() => null),

      // Form funnel: views → start → submit
      phQuery({
        kind: 'TrendsQuery',
        series: [
          { kind: 'EventsNode', event: 'section_view', name: 'Form seen', math: 'total',
            properties: [{ key: 'section', value: 'contact_form', operator: 'exact', type: 'event' }] },
          { kind: 'EventsNode', event: 'form_start', name: 'Form started', math: 'total' },
          { kind: 'EventsNode', event: 'form_submit', name: 'Form submitted', math: 'total' },
        ],
        dateRange: { date_from: dateFrom },
        interval: 'day',
      }).catch(() => null),
    ])

    return NextResponse.json({
      configured: true,
      days,
      trend: trendData,
      uniqueVisitors,
      topPages,
      topReferrers,
      topCountries,
      topBrowsers,
      topDevices,
      sectionViews,
      scrollDepth,
      formFunnel,
    })
  } catch (e: unknown) {
    return NextResponse.json({ configured: true, error: e instanceof Error ? e.message : 'Failed to fetch analytics' }, { status: 500 })
  }
}
