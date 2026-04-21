import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

const copyFilePath = path.join(process.cwd(), '..', 'touchpulse', 'content', 'siteCopy.json')

export async function GET() {
  try {
    const raw = await fs.readFile(copyFilePath, 'utf8')
    const parsed = JSON.parse(raw)
    return NextResponse.json({ value: parsed })
  } catch (error) {
    console.error('Failed to read site copy:', error)
    return NextResponse.json({ error: 'Failed to read website copy file' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const value = body?.value
    if (!value || typeof value !== 'object') {
      return NextResponse.json({ error: 'Invalid website copy payload' }, { status: 400 })
    }

    const serialized = `${JSON.stringify(value, null, 2)}\n`
    await fs.writeFile(copyFilePath, serialized, 'utf8')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save site copy:', error)
    return NextResponse.json({ error: 'Failed to save website copy file' }, { status: 500 })
  }
}
