import { NextRequest, NextResponse } from 'next/server'
import { readEditableTouchpulseFile, writeEditableTouchpulseFile, isAllowedEditablePath } from '@/lib/website-manager/files'

export const runtime = 'nodejs'

async function readFromGitHub(relPath: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'liamgeschwindt1/website'
  if (!token) throw new Error('Local file not found and GITHUB_TOKEN not configured')
  const encoded = relPath.split('/').map(encodeURIComponent).join('/')
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/touchpulse/${encoded}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({} as { message?: string })) as { message?: string }
    throw new Error(err.message ?? `GitHub: file not found (${res.status})`)
  }
  const data = await res.json() as { content?: string }
  if (!data.content) throw new Error('GitHub returned empty content')
  return Buffer.from(data.content, 'base64').toString('utf8')
}

export async function GET(req: NextRequest) {
  const relPath = req.nextUrl.searchParams.get('path')
  if (!relPath) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 })
  }
  if (!isAllowedEditablePath(relPath)) {
    return NextResponse.json({ error: 'Path is not allowed' }, { status: 400 })
  }

  // Try local filesystem first (works in dev), then fall back to GitHub API (works in production)
  try {
    const content = await readEditableTouchpulseFile(relPath)
    return NextResponse.json({ path: relPath, content, source: 'local' })
  } catch {
    // Local file not available — CMS is running in a separate container from touchpulse
  }

  try {
    const content = await readFromGitHub(relPath)
    return NextResponse.json({ path: relPath, content, source: 'github' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: 404 },
    )
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null)
  const relPath = payload?.path
  const content = payload?.content

  if (!relPath || typeof relPath !== 'string') {
    return NextResponse.json({ error: 'path is required' }, { status: 400 })
  }
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'content must be a string' }, { status: 400 })
  }

  try {
    await writeEditableTouchpulseFile(relPath, content)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to write file' },
      { status: 400 },
    )
  }
}

