import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl

  // If it has a code param (Supabase confirmation), redirect to callback
  const code = searchParams.get('code')
  if (code && pathname !== '/auth/callback') {
    const callbackUrl = new URL('/auth/callback', origin)
    callbackUrl.searchParams.set('code', code)
    return NextResponse.redirect(callbackUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
