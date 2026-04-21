import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const KEY = 'footer_content'

export async function GET() {
  const row = await prisma.siteContent.findUnique({ where: { key: KEY } })
  return NextResponse.json({ value: row?.value ?? '' })
}

export async function POST(req: NextRequest) {
  const { value } = await req.json()
  await prisma.siteContent.upsert({
    where: { key: KEY },
    create: { key: KEY, value: String(value ?? '') },
    update: { value: String(value ?? '') },
  })
  return NextResponse.json({ ok: true })
}