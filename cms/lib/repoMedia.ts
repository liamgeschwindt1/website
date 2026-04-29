import fs from 'fs'
import path from 'path'

/** Mime type lookup for common extensions. */
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
}

export interface RepoMediaItem {
  id: string
  filename: string
  relativePath: string
  mimeType: string
  size: number
  url: string
  alt: string | null
  createdAt: string
}

/**
 * Resolve the touchpulse public/images directory.
 * In monorepo dev: ../touchpulse/public/images
 * Allow override via TOUCHPULSE_PUBLIC_DIR env var.
 */
export function getTouchpulseImagesDir(): string | null {
  const override = process.env.TOUCHPULSE_PUBLIC_DIR
  if (override) {
    const abs = path.resolve(override, 'images')
    if (fs.existsSync(abs)) return abs
  }
  // Try sibling package layout (cms and touchpulse are siblings)
  const candidates = [
    path.resolve(process.cwd(), '../touchpulse/public/images'),
    path.resolve(process.cwd(), '../../touchpulse/public/images'),
    path.resolve(process.cwd(), 'touchpulse/public/images'),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

function walk(root: string, dir: string, acc: string[]): void {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      walk(root, full, acc)
    } else if (e.isFile()) {
      acc.push(path.relative(root, full))
    }
  }
}

/** List image/media files from the touchpulse public/images tree. */
export function listRepoMedia(): RepoMediaItem[] {
  const root = getTouchpulseImagesDir()
  if (!root) return []
  const files: string[] = []
  walk(root, root, files)
  const items: RepoMediaItem[] = []
  for (const rel of files) {
    const ext = path.extname(rel).toLowerCase()
    const mime = MIME[ext]
    if (!mime) continue
    let stat: fs.Stats
    try {
      stat = fs.statSync(path.join(root, rel))
    } catch {
      continue
    }
    items.push({
      id: `fs:${rel}`,
      filename: path.basename(rel),
      relativePath: rel,
      mimeType: mime,
      size: stat.size,
      url: `/api/repo-media/${rel.split(path.sep).map(encodeURIComponent).join('/')}`,
      alt: null,
      createdAt: stat.mtime.toISOString(),
    })
  }
  // Newest first
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items
}
