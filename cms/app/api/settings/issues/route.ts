import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const KEY = 'issue_settings'

export async function GET() {
  const row = await prisma.siteContent.findUnique({ where: { key: KEY } }).catch(() => null)
  const settings = row ? JSON.parse(row.value) : { assignee: null }
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  const { assignee } = await req.json()
  const value = JSON.stringify({ assignee: assignee ?? null })
  await prisma.siteContent.upsert({
    where: { key: KEY },
    create: { key: KEY, value },
    update: { value },
  })
  return NextResponse.json({ ok: true })
}
