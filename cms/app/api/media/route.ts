import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, filename: true, mimeType: true, size: true, alt: true, createdAt: true },
  })
  return NextResponse.json({ media: media.map(m => ({ ...m, url: `/api/media/${m.id}` })) })
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const MAX = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url: '', // placeholder — we'll use /api/media/[id]
        data: buffer,
      },
    })
    return NextResponse.json({
      media: { id: media.id, filename: media.filename, mimeType: media.mimeType, size: media.size, alt: media.alt, createdAt: media.createdAt.toISOString(), url: `/api/media/${media.id}` },
    }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
