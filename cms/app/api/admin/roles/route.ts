import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminRoleEntries, saveAdminRoleEntries, type AdminRoleEntry } from '@/lib/adminRoles'

function getSessionRole(session: { user?: unknown } | null) {
  return ((session?.user as { role?: string } | undefined)?.role) ?? 'editor'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (getSessionRole(session) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const entries = await getAdminRoleEntries()
  return NextResponse.json({ entries })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (getSessionRole(session) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as { entries?: AdminRoleEntry[] }
  await saveAdminRoleEntries(body.entries ?? [])
  return NextResponse.json({ ok: true })
}