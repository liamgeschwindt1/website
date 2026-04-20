import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/admin/login', '/api/auth', '/api/posts']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect /admin routes — presence check; real validation in server components
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('cms_auth')
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
