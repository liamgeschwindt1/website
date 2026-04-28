import { promises as fs } from 'fs'
import path from 'path'

const EDITABLE_EXTENSIONS = new Set(['.tsx', '.ts', '.css', '.json', '.md'])
const BLOCKED_DIRS = new Set(['node_modules', '.next'])
const BLOCKED_PREFIXES = ['app/api/', 'app/fonts/']

export type EditableFileEntry = {
  path: string
  size: number
}

function getRepoRoot() {
  return path.resolve(process.cwd(), '..')
}

export function getTouchpulseRoot() {
  return path.join(getRepoRoot(), 'touchpulse')
}

export function isAllowedEditablePath(relPath: string) {
  if (!relPath || relPath.startsWith('/') || relPath.includes('..')) return false
  if (BLOCKED_PREFIXES.some((prefix) => relPath.startsWith(prefix))) return false
  const ext = path.extname(relPath)
  return EDITABLE_EXTENSIONS.has(ext)
}

export function resolveTouchpulsePath(relPath: string) {
  if (!isAllowedEditablePath(relPath)) {
    throw new Error('Path is not editable')
  }

  const base = getTouchpulseRoot()
  const abs = path.join(base, relPath)
  const normalizedBase = `${path.resolve(base)}${path.sep}`
  const normalizedAbs = path.resolve(abs)
  if (!normalizedAbs.startsWith(normalizedBase)) {
    throw new Error('Invalid path')
  }
  return normalizedAbs
}

async function walk(dir: string, root: string, out: EditableFileEntry[]) {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    if (BLOCKED_DIRS.has(entry.name)) continue

    const absPath = path.join(dir, entry.name)
    const relPath = path.relative(root, absPath).split(path.sep).join('/')

    if (entry.isDirectory()) {
      if (BLOCKED_PREFIXES.some((prefix) => relPath.startsWith(prefix))) continue
      await walk(absPath, root, out)
      continue
    }

    if (!isAllowedEditablePath(relPath)) continue
    const stat = await fs.stat(absPath)
    out.push({ path: relPath, size: stat.size })
  }
}

export async function listEditableTouchpulseFiles() {
  const root = getTouchpulseRoot()
  const out: EditableFileEntry[] = []

  for (const section of ['app', 'components', 'content']) {
    const sectionPath = path.join(root, section)
    try {
      const stat = await fs.stat(sectionPath)
      if (!stat.isDirectory()) continue
      await walk(sectionPath, root, out)
    } catch {
      // Skip missing sections.
    }
  }

  out.sort((a, b) => a.path.localeCompare(b.path))
  return out
}

export async function readEditableTouchpulseFile(relPath: string) {
  const absPath = resolveTouchpulsePath(relPath)
  return fs.readFile(absPath, 'utf8')
}

export async function writeEditableTouchpulseFile(relPath: string, content: string) {
  const absPath = resolveTouchpulsePath(relPath)
  await fs.writeFile(absPath, content, 'utf8')
}
