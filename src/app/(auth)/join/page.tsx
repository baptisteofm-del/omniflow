'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, AlertTriangle, LogIn, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInvitationByToken, acceptInvitation } from '@/lib/team/actions'

function JoinContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'auth_required' | 'accepting' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [invite, setInvite] = useState<{ email: string; agencyName: string; roleName: string } | null>(null)
  const [agencyName, setAgencyName] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setErrorMessage("Lien d'invitation invalide")
        setStatus('error')
        return
      }

      const invitation = await getInvitationByToken(token)
      if (!invitation || invitation.status === 'revoked') {
        setErrorMessage("Cette invitation n'existe plus ou a été révoquée")
        setStatus('error')
        return
      }
      setInvite(invitation)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setStatus('auth_required')
        return
      }

      setStatus('accepting')
      try {
        const result = await acceptInvitation(token)
        setAgencyName(result.agencyName)
        setStatus('success')
        setTimeout(() => router.push('/home'), 1800)
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Erreur lors de l'acceptation")
        setStatus('error')
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const joinPath = `/join?token=${token}`
  const registerUrl = `/register?redirect=${encodeURIComponent(joinPath)}`
  const loginUrl = `/login?redirect=${encodeURIComponent(joinPath)}`

  if (status === 'loading' || status === 'accepting') {
    return (
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[color:var(--cyan)]" />
        <p className="text-sm font-medium">{status === 'accepting' ? "Validation de l'invitation..." : 'Chargement...'}</p>
      </div>
    )
  }

  if (status === 'auth_required') {
    return (
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <div className="glow-sm mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
          <UserPlus className="h-6 w-6 text-[color:var(--cyan)]" />
        </div>
        <h1 className="mb-1 text-xl font-semibold">Invitation OmniFlow</h1>
        <p className="mb-5 text-sm text-[color:var(--foreground-muted)]">
          Vous êtes invité(e) à rejoindre <span className="text-[color:var(--foreground)]">{invite?.agencyName}</span> en tant que{' '}
          <span className="text-[color:var(--foreground)]">{invite?.roleName}</span>.
        </p>
        {invite?.email && (
          <div className="mb-6 rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2.5 text-xs text-[color:var(--foreground-muted)]">
            Créez votre compte avec : <strong className="text-[color:var(--foreground)]">{invite.email}</strong>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href={registerUrl}
            className="gradient-bg-signature flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Créer mon compte
          </Link>
          <Link
            href={loginUrl}
            className="flex items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] py-3 text-sm text-[color:var(--foreground-muted)] hover:bg-white/5"
          >
            <LogIn className="h-4 w-4" />
            J&apos;ai déjà un compte
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--success)]/40 bg-[color:var(--success)]/10">
          <CheckCircle2 className="h-6 w-6 text-[color:var(--success)]" />
        </div>
        <h1 className="mb-2 text-xl font-semibold">Bienvenue dans l&apos;équipe !</h1>
        <p className="mb-5 text-sm text-[color:var(--foreground-muted)]">
          Vous avez rejoint <strong className="text-[color:var(--foreground)]">{agencyName}</strong>. Redirection...
        </p>
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-[color:var(--foreground-muted)]" />
      </div>
    )
  }

  return (
    <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10">
        <AlertTriangle className="h-6 w-6 text-[color:var(--danger)]" />
      </div>
      <h1 className="mb-2 text-xl font-semibold">Invitation invalide</h1>
      <p className="mb-6 text-sm text-[color:var(--foreground-muted)]">{errorMessage}</p>
      <div className="flex flex-col gap-2">
        <Link
          href="/home"
          className="gradient-bg-signature flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Aller à l&apos;accueil
        </Link>
        <Link href="/login" className="py-2 text-sm text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
          Se connecter avec un autre compte
        </Link>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="glass flex w-full max-w-md items-center justify-center rounded-2xl p-8">
          <Loader2 className="h-7 w-7 animate-spin text-[color:var(--cyan)]" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  )
}
