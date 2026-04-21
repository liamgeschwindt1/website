import { prisma } from '@/lib/prisma'
import MediaLibraryClient from '@/components/MediaLibraryClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, filename: true, mimeType: true, size: true, alt: true, createdAt: true },
  })

  const items = media.map(m => ({
    ...m,
    url: `/api/media/${m.id}`,
    folder: null as string | null,
    createdAt: m.createdAt.toISOString(),
  }))

  return <MediaLibraryClient initialMedia={items} />
}
