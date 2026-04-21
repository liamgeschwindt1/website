import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const media = await prisma.media.findUnique({ where: { id: params.id } })
  if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new NextResponse(Buffer.from(media.data) as unknown as BodyInit, {
    headers: {
      'Content-Type': media.mimeType,
      'Content-Disposition': `inline; filename="${media.filename}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if ('alt' in body) data.alt = body.alt
  if ('folder' in body) data.folder = body.folder ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const media = await (prisma.media.update as any)({ where: { id: params.id }, data })
  return NextResponse.json({ media })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.media.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
