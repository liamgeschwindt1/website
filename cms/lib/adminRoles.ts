import { prisma } from '@/lib/prisma'

export type UserRole = 'admin' | 'editor' | 'viewer'

export type AdminRoleEntry = {
  email: string
  role: UserRole
}

const KEY = 'admin_roles'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function getAdminRoleEntries(): Promise<AdminRoleEntry[]> {
  const row = await prisma.siteContent.findUnique({ where: { key: KEY } }).catch(() => null)
  if (!row?.value) return []

  try {
    const parsed = JSON.parse(row.value) as AdminRoleEntry[]
    return parsed
      .filter((entry) => entry?.email && entry?.role)
      .map((entry) => ({ email: normalizeEmail(entry.email), role: entry.role }))
  } catch {
    return []
  }
}

export async function saveAdminRoleEntries(entries: AdminRoleEntry[]) {
  const value = JSON.stringify(
    entries
      .map((entry) => ({ email: normalizeEmail(entry.email), role: entry.role }))
      .filter((entry) => entry.email)
      .sort((left, right) => left.email.localeCompare(right.email))
  )

  await prisma.siteContent.upsert({
    where: { key: KEY },
    create: { key: KEY, value },
    update: { value },
  })
}

export async function getRoleForEmail(email: string): Promise<UserRole> {
  const entries = await getAdminRoleEntries()
  if (entries.length === 0) return 'admin'
  return entries.find((entry) => entry.email === normalizeEmail(email))?.role ?? 'editor'
}