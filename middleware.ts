import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/calculator',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.startsWith('/api/auth')
  if (isPublic) return NextResponse.next()

  const uid = req.cookies.get('uid')?.value
  if (!uid) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 