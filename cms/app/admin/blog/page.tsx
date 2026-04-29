import { prisma } from '@/lib/prisma'
import BlogClient from './BlogClient'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  let posts: Array<{
    id: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    coverImage: string | null
    published: boolean
    publishedAt: string | null
    createdAt: string
  }> = []

  try {
    const raw = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        coverImage: true,
        published: true,
        publishedAt: true,
        createdAt: true,
      },
    })
    posts = raw.map(p => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }))
  } catch {
    // DB error handled in client
  }

  return <BlogClient initialPosts={posts} />
}
