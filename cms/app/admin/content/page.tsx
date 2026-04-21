import { prisma } from '@/lib/prisma'
import ContentManager from '@/components/ContentManager'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  const [pages, posts, footerContentRow] = await Promise.all([
    prisma.page.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.post.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.siteContent.findUnique({ where: { key: 'footer_content' } }),
  ])

  return (
    <ContentManager pages={pages} posts={posts} footerContent={footerContentRow?.value ?? ''} />
  )
}
