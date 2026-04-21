import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ pages })
}

export async function POST(req: NextRequest) {
  try {
    const { title, slug, content, excerpt, seoTitle, seoDesc, published } = await req.json()
    if (!title || !slug || !content)
      return NextResponse.json({ error: 'title, slug, and content are required' }, { status: 400 })
    const page = await prisma.page.create({
      data: { title, slug, content, excerpt: excerpt || null, seoTitle: seoTitle || null, seoDesc: seoDesc || null, published: published ?? false },
    })
    return NextResponse.json({ page }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
