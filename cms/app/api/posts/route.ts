import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public: GET all published posts
export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, title: true, slug: true, excerpt: true,
      coverImage: true, published: true, publishedAt: true,
      createdAt: true, updatedAt: true,
    },
  })
  return NextResponse.json({ posts })
}

// Create a post
export async function POST(req: NextRequest) {
  try {
    const { title, slug, excerpt, content, coverImage, published } = await req.json()
    if (!title || !slug || !content)
      return NextResponse.json({ error: 'title, slug, and content are required' }, { status: 400 })

    const post = await prisma.post.create({
      data: {
        title, slug, excerpt: excerpt ?? null, content,
        coverImage: coverImage ?? null,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
      },
    })
    return NextResponse.json({ post }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
