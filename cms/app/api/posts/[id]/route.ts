import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

interface Params {
  params: { id: string }
}

// Public: GET single post by id or slug
export async function GET(_req: NextRequest, { params }: Params) {
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ id: params.id }, { slug: params.id }],
      published: true,
    },
  })

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post })
}

// Admin: update a post
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, slug, excerpt, content, coverImage, published } = body

    const existing = await prisma.post.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        excerpt: excerpt ?? null,
        content,
        coverImage: coverImage ?? null,
        published: published ?? false,
        publishedAt: published && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    })

    return NextResponse.json({ post })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Admin: delete a post
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
