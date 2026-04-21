import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'liamgeschwindt1/website'

  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  try {
    const [pullsRes, runsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        next: { revalidate: 0 },
      }),
      fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=50&status=in_progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        next: { revalidate: 0 },
      }),
    ])

    if (!pullsRes.ok) return NextResponse.json({ error: 'GitHub error' }, { status: pullsRes.status })

    const pulls = await pullsRes.json()
    const runs = runsRes.ok ? (await runsRes.json()).workflow_runs ?? [] : []

    const enriched = pulls.map((pr: Record<string, unknown>) => {
      const prRuns = runs.filter((r: Record<string, unknown>) => r.head_sha === pr.head_sha)
      const latestRun = prRuns[0] ?? null
      return {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        draft: pr.draft,
        user: (pr.user as Record<string, unknown>)?.login,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        html_url: pr.html_url,
        head: { ref: (pr.head as Record<string, unknown>)?.ref, sha: (pr.head as Record<string, unknown>)?.sha },
        base: { ref: (pr.base as Record<string, unknown>)?.ref },
        mergeable: pr.mergeable,
        labels: (pr.labels as Record<string, unknown>[])?.map((l) => ({ name: l.name, color: l.color })) ?? [],
        ci_status: latestRun?.conclusion ?? latestRun?.status ?? null,
      }
    })

    return NextResponse.json(enriched)
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
