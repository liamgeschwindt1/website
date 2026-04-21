import { NextRequest, NextResponse } from 'next/server'

interface Params { params: { number: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'liamgeschwindt1/website'

  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  const { merge_method = 'squash', commit_message } = await req.json().catch(() => ({}))

  const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${params.number}/merge`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ merge_method, commit_message }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message ?? 'Merge failed' }, { status: res.status })
  }

  return NextResponse.json({ ok: true })
}
