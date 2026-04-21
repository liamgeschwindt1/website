import { NextResponse } from 'next/server'

// Auth is now handled by NextAuth Google OAuth — this route is deprecated.
export async function POST() {
  return NextResponse.json({ error: 'Use Google sign-in via /api/auth/signin' }, { status: 410 })
}
