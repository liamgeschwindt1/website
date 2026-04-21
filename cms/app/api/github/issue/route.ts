import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'liamgeschwindt1/website'

  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  try {
    const { title, body, label } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    // Read issue settings from DB
    const settingsRow = await prisma.siteContent.findUnique({ where: { key: 'issue_settings' } }).catch(() => null)
    const settings = settingsRow ? JSON.parse(settingsRow.value) : {}
    const assignee: string | null = settings.assignee ?? null

    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: title.trim(),
        body: body ?? '',
        labels: label ? [label] : [],
        ...(assignee ? { assignees: [assignee] } : {}),
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.message ?? 'GitHub error' }, { status: res.status })
    }

    const issue = await res.json()
    return NextResponse.json({ issue: { number: issue.number, url: issue.html_url } }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
