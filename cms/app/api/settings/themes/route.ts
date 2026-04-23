import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { THEMES } from '@/lib/themes'

const KEY = 'cms_theme'

export async function GET() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: KEY } })
    const themeId = row?.value ? JSON.parse(row.value).id : 'default'
    return NextResponse.json({ themeId, themes: Object.keys(THEMES) })
  } catch {
    return NextResponse.json({ themeId: 'default', themes: Object.keys(THEMES) })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { themeId } = await req.json()
    if (!THEMES[themeId as keyof typeof THEMES]) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }

    await prisma.siteContent.upsert({
      where: { key: KEY },
      create: { key: KEY, value: JSON.stringify({ id: themeId }) },
      update: { value: JSON.stringify({ id: themeId }) },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save theme:', error)
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 })
  }
}
