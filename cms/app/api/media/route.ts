import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, filename: true, mimeType: true, size: true, alt: true, createdAt: true },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json({ media: media.map(m => ({ ...m, folder: (m as any).folder ?? null, url: `/api/media/${m.id}` })) })
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const MAX = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })

    const folder = (form.get('folder') as string | null) || null
    const buffer = Buffer.from(await file.arrayBuffer())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const media = await (prisma.media.create as any)({
      data: {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url: '',
        data: buffer,
        ...(folder ? { folder } : {}),
      },
    })
    return NextResponse.json({
      media: { id: media.id, filename: media.filename, mimeType: media.mimeType, size: media.size, alt: media.alt, folder: folder, createdAt: new Date(media.createdAt).toISOString(), url: `/api/media/${media.id}` },
    }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
