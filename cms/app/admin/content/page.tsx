import { prisma } from '@/lib/prisma'
import ContentManager from '@/components/ContentManager'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  let pages = []
  let posts = []
  let footerContent = ''
  let loadError = ''
  try {
    const [loadedPages, loadedPosts, footerContentRow] = await Promise.all([
      prisma.page.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.post.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.siteContent.findUnique({ where: { key: 'footer_content' } }),
    ])

    pages = loadedPages
    posts = loadedPosts
    footerContent = footerContentRow?.value ?? ''
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database error'
    console.error('Failed to load admin content page data:', err)
    loadError = `Failed to load content from database. Check DATABASE_URL and Prisma migrations. (${msg})`
  }

  return <ContentManager pages={pages} posts={posts} footerContent={footerContent} loadError={loadError} />
}
