import type { CSSProperties } from 'react'

/** Convert a string to a URL-safe slug */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** MIME type helpers */
export const isImage = (mime: string) => mime.startsWith('image/')
export const isVideo = (mime: string) => mime.startsWith('video/')
export const isAudio = (mime: string) => mime.startsWith('audio/')

/** Format a byte count into a human-readable string */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Create a GitHub issue via the CMS API. Returns the created issue URL or throws. */
export async function createGithubIssue(payload: {
  title: string
  body: string
  label: string
}): Promise<string> {
  const res = await fetch('/api/github/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to create issue')
  return data.url as string
}

/** Returns inline style object for an active/inactive toggle button */
export function toggleButtonStyle(active: boolean): CSSProperties {
  return active
    ? { background: 'rgba(1,180,175,0.15)', borderColor: 'var(--teal)', color: 'var(--teal)' }
    : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted)' }
}
