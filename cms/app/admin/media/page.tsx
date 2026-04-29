import { prisma } from '@/lib/prisma'
import MediaLibraryClient from '@/components/MediaLibraryClient'
import { listRepoMedia } from '@/lib/repoMedia'

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

  const dbItems = media.map(m => ({
    ...m,
    url: `/api/media/${m.id}`,
    createdAt: m.createdAt.toISOString(),
  }))

  // Append filesystem-backed images from the touchpulse public folder.
  // These are read-only; the client suppresses delete/edit for ids prefixed with `fs:`.
  const repoItems = listRepoMedia().map(r => ({
    id: r.id,
    filename: r.filename,
    mimeType: r.mimeType,
    size: r.size,
    url: r.url,
    alt: r.alt,
    createdAt: r.createdAt,
  }))

  const items = [...dbItems, ...repoItems]

  return <MediaLibraryClient initialMedia={items} loadError={loadError} />
}
