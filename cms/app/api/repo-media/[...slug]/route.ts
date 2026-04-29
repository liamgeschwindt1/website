import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getTouchpulseImagesDir } from '@/lib/repoMedia'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string[] } }) {
  const root = getTouchpulseImagesDir()
  if (!root) return new NextResponse('Repo media root not configured', { status: 404 })

  const safeParts = (params.slug || []).map(p => decodeURIComponent(p))
  const target = path.resolve(root, ...safeParts)

  // Path traversal guard — must remain inside root
  if (!target.startsWith(root + path.sep) && target !== root) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  let stat: fs.Stats
  try {
    stat = fs.statSync(target)
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
  if (!stat.isFile()) return new NextResponse('Not found', { status: 404 })

  const ext = path.extname(target).toLowerCase()
  const mime = MIME[ext] ?? 'application/octet-stream'
  const buf = fs.readFileSync(target)
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Length': String(stat.size),
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
