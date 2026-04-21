import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const page = await prisma.page.findUnique({ where: { id: params.id } })
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ page })
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { title, slug, content, excerpt, seoTitle, seoDesc, published } = await req.json()
    const page = await prisma.page.update({
      where: { id: params.id },
      data: { title, slug, content, excerpt: excerpt || null, seoTitle: seoTitle || null, seoDesc: seoDesc || null, published },
    })
    return NextResponse.json({ page })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.page.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
