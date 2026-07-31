import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Callback pour la réinitialisation du mot de passe
 * Supabase envoie un lien avec un code, cet endpoint l'échange contre une session
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Retour à la page de réinitialisation en cas d'erreur
  return NextResponse.redirect(new URL('/reset-password?error=invalid_code', requestUrl.origin))
}
