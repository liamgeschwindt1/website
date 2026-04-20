import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// Public: GET all published posts (used by touchpulse.nl)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  // ?all=true requires valid API key
  if (all) {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.CMS_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const posts = await prisma.post.findMany({
    where: all ? undefined : { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ posts })
}

// Admin: create a post
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, slug, excerpt, content, coverImage, published } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'title, slug, and content are required' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt ?? null,
        content,
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
