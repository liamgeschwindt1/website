import { prisma } from '@/lib/prisma'
import ContentManager from '@/components/ContentManager'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  let pages, posts, footerContentRow
  try {
    ;[pages, posts, footerContentRow] = await Promise.all([
      prisma.page.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.post.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.siteContent.findUnique({ where: { key: 'footer_content' } }),
    ])
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database error'
    throw new Error(`Failed to load content. Check DATABASE_URL is set on Railway. (${msg})`)
  }

  return (
    <ContentManager pages={pages} posts={posts} footerContent={footerContentRow?.value ?? ''} />
  )
}
