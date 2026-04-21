import { NextResponse } from 'next/server'

// Sign-out is handled client-side by next-auth's signOut().
// This route is kept for backwards compatibility but redirects to the login page.
export async function POST() {
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3001'))
}
