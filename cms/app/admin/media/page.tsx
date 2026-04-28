import { prisma } from '@/lib/prisma'
import MediaLibraryClient from '@/components/MediaLibraryClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  let media
  try {
    media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, filename: true, mimeType: true, size: true, alt: true, createdAt: true },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database error'
    throw new Error(`Failed to load media library. Check DATABASE_URL is set on Railway. (${msg})`)
  }

  const items = media.map(m => ({
    ...m,
    url: `/api/media/${m.id}`,
    createdAt: m.createdAt.toISOString(),
  }))

  return <MediaLibraryClient initialMedia={items} />
}
