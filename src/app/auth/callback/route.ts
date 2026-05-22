import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/resend'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError && data.user) {
      // After successful email confirmation, send welcome email
      try {
        const { data: agency } = await supabase
          .from('agencies')
          .select('name')
          .eq('owner_id', data.user.id)
          .single()

        if (agency && data.user.email) {
          await sendWelcomeEmail(data.user.email, agency.name || 'votre agence')
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't block auth callback if email fails
      }
      
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
