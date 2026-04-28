import { NextRequest, NextResponse } from 'next/server'

type ChangedFile = {
  path: string
  content: string
}

type CreatePRPayload = {
  title?: string
  body?: string
  files?: ChangedFile[]
}

const OWNER_REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

function encodeContent(content: string) {
  return Buffer.from(content, 'utf8').toString('base64')
}

function ensureValidPath(filePath: string) {
  return !!filePath && !filePath.startsWith('/') && !filePath.includes('..')
}

function encodeRepoPath(filePath: string) {
  return filePath.split('/').map(encodeURIComponent).join('/')
}

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO ?? 'liamgeschwindt1/website'
  const baseBranch = process.env.GITHUB_BASE_BRANCH ?? 'main'

  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
  if (!OWNER_REPO.test(repo)) return NextResponse.json({ error: 'GITHUB_REPO is invalid' }, { status: 500 })

  const payload = (await req.json().catch(() => null)) as CreatePRPayload | null
  const title = payload?.title?.trim()
  const body = payload?.body?.trim() ?? ''
  const files = payload?.files ?? []

  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'At least one changed file is required' }, { status: 400 })
  }

  for (const file of files) {
    if (!file || typeof file.path !== 'string' || typeof file.content !== 'string') {
      return NextResponse.json({ error: 'Each file requires path and content' }, { status: 400 })
    }
    if (!ensureValidPath(file.path)) {
      return NextResponse.json({ error: `Invalid file path: ${file.path}` }, { status: 400 })
    }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  try {
    const branchName = `website-manager/${Date.now()}`

    const refRes = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/${baseBranch}`, {
      headers,
      cache: 'no-store',
    })
    if (!refRes.ok) {
      const err = await refRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.message ?? `Failed to read base branch ${baseBranch}` }, { status: refRes.status })
    }
    const refData = await refRes.json()
    const baseSha = refData?.object?.sha
    if (!baseSha) return NextResponse.json({ error: 'Failed to resolve base branch SHA' }, { status: 500 })

    const createRefRes = await fetch(`https://api.github.com/repos/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
    })
    if (!createRefRes.ok) {
      const err = await createRefRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.message ?? 'Failed to create branch' }, { status: createRefRes.status })
    }

    const touchedPaths: string[] = []

    for (const file of files) {
      const repoPath = `touchpulse/${file.path}`
      let existingSha: string | undefined
      const encodedPath = encodeRepoPath(repoPath)

      const currentRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(baseBranch)}`,
        { headers, cache: 'no-store' },
      )

      if (currentRes.ok) {
        const currentJson = await currentRes.json()
        existingSha = currentJson?.sha
      }

      const updateRes = await fetch(`https://api.github.com/repos/${repo}/contents/${encodedPath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Website Manager update: ${file.path}`,
          branch: branchName,
          content: encodeContent(file.content),
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      })

      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}))
        return NextResponse.json(
          { error: err.message ?? `Failed to update ${file.path}` },
          { status: updateRes.status },
        )
      }

      touchedPaths.push(repoPath)
    }

    const prRes = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        head: branchName,
        base: baseBranch,
        body: body || 'Created from Website Manager',
      }),
    })

    if (!prRes.ok) {
      const err = await prRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.message ?? 'Failed to create pull request' }, { status: prRes.status })
    }

    const pr = await prRes.json()
    return NextResponse.json({
      ok: true,
      number: pr.number,
      url: pr.html_url,
      branch: branchName,
      files: touchedPaths,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create pull request' },
      { status: 500 },
    )
  }
}
