'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Loader2, CheckCircle2, AlertTriangle, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function JoinContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token    = params.get('invitation') || params.get('token') || ''
  const email    = params.get('email') || ''
  const agencyId = params.get('agency') || ''

  const [status, setStatus] = useState<'loading' | 'auth_required' | 'accepting' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const supabase = createClient()

  // URLs de redirection
  // Pour un invité sans compte → inscription directe (parcours principal)
  const registerUrl = `/register?invitation=${token}&email=${encodeURIComponent(email)}&agency=${agencyId}`
  // Pour un invité avec compte existant → connexion avec retour vers /join
  const joinPath    = `/join?invitation=${token}&email=${encodeURIComponent(email)}&agency=${agencyId}`
  const loginUrl    = `/login?redirect=${encodeURIComponent(joinPath)}`

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('auth_required')
      } else {
        await handleAccept()
      }
    }
    check()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAccept = async () => {
    setStatus('accepting')
    try {
      const res = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, agencyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAgencyName(data.agencyName || 'OmniFlow')
      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (e: any) {
      setErrorMessage(e.message || "Erreur lors de l'acceptation")
      setStatus('error')
    }
  }

  // ── Loading / Accepting ────────────────────────────────────
  if (status === 'loading' || status === 'accepting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Validation de l'invitation...</p>
          <p className="text-gray-500 text-sm">Vous allez être redirigé vers le dashboard.</p>
        </div>
      </div>
    )
  }

  // ── Auth required ──────────────────────────────────────────
  if (status === 'auth_required') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-purple-500/20">
            <Zap size={26} className="text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invitation OmniFlow</h1>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">
            Vous avez été invité(e) à rejoindre une agence OmniFlow.
          </p>

          {email && (
            <div className="text-xs text-gray-500 mb-6 px-3 py-2.5 bg-white/3 border border-white/8 rounded-xl">
              Invitation destinée à : <strong className="text-gray-300">{email}</strong>
            </div>
          )}

          {/* Bouton principal : Créer un compte (parcours le plus fréquent) */}
          <div className="flex flex-col gap-3">
            <Link
              href={registerUrl}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              <UserPlus size={16} />
              Créer mon compte
            </Link>

            {/* Bouton secondaire : connexion si compte existant */}
            <Link
              href={loginUrl}
              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-all"
            >
              <LogIn size={16} />
              J'ai déjà un compte — Se connecter
            </Link>
          </div>

          <p className="text-xs text-gray-600 mt-5">
            Après connexion, vous serez automatiquement ajouté(e) à l'agence.
          </p>
        </div>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#0f0f1a] border border-green-500/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-green-500/20">
            <CheckCircle2 size={26} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Bienvenue dans l'équipe !</h1>
          <p className="text-gray-400 text-sm mb-6">
            Vous avez rejoint <strong className="text-white">{agencyName}</strong> avec succès.
            Redirection vers le dashboard...
          </p>
          <Loader2 size={20} className="animate-spin text-green-400 mx-auto" />
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border border-red-500/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/20">
          <AlertTriangle size={26} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Invitation invalide</h1>
        <p className="text-gray-400 text-sm mb-6">
          {errorMessage || "Ce lien d'invitation est invalide ou a expiré."}
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            Aller au dashboard
          </Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-300 py-2">
            Se connecter avec un autre compte
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-purple-400" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  )
}
