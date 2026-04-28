import { NextRequest, NextResponse } from 'next/server'
import { readEditableTouchpulseFile, writeEditableTouchpulseFile } from '@/lib/website-manager/files'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const relPath = req.nextUrl.searchParams.get('path')
  if (!relPath) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 })
  }

  try {
    const content = await readEditableTouchpulseFile(relPath)
    return NextResponse.json({ path: relPath, content })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: 400 },
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
