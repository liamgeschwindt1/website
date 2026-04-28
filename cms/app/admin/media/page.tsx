import { prisma } from '@/lib/prisma'
import MediaLibraryClient from '@/components/MediaLibraryClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  let media: Array<{ id: string; filename: string; mimeType: string; size: number; alt: string | null; createdAt: Date }> = []
  let loadError = ''
  try {
    media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, filename: true, mimeType: true, size: true, alt: true, createdAt: true },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database error'
    console.error('Failed to load admin media page data:', err)
    loadError = `Failed to load media from database. Check DATABASE_URL and Prisma migrations. (${msg})`
  }

  const items = media.map(m => ({
    ...m,
    url: `/api/media/${m.id}`,
    createdAt: m.createdAt.toISOString(),
  }))

  return <MediaLibraryClient initialMedia={items} loadError={loadError} />
}
