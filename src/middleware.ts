import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl

  // Si on arrive sur n'importe quelle page avec un ?code= (lien de confirmation Supabase)
  // on redirige automatiquement vers /auth/callback
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
