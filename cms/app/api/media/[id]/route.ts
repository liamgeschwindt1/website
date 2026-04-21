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
  const { alt } = await req.json()
  const media = await prisma.media.update({ where: { id: params.id }, data: { alt } })
  return NextResponse.json({ media })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.media.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
