import { NextResponse } from 'next/server'
import { listEditableTouchpulseFiles } from '@/lib/website-manager/files'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const files = await listEditableTouchpulseFiles()
    return NextResponse.json({ files })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list files' },
      { status: 500 },
    )
  }
}
