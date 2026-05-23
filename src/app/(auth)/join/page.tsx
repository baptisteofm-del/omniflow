'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Loader2, CheckCircle2, AlertTriangle, LogIn } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<string, string> = {
  video_editor:      'Monteur Vidéo',
  chatting_manager:  'Manager Chatting',
  marketing_manager: 'Manager Marketing',
  admin:             'Administrateur',
  member:            'Membre',
}

function JoinContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token    = params.get('invitation') || params.get('token') || ''
  const email    = params.get('email') || ''
  const agencyId = params.get('agency') || ''

  const [status, setStatus] = useState<'loading' | 'auth_required' | 'accepting' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        setStatus('auth_required')
      } else {
        // Utilisateur connecté → accepter directement
        handleAccept(user)
      }
    }
    check()
  }, [])

  const handleAccept = async (currentUser?: any) => {
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
      // Rediriger vers le dashboard après 2s
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (e: any) {
      setMessage(e.message || 'Erreur lors de l\'acceptation')
      setStatus('error')
    }
  }

  // ── Auth required ──────────────────────────────────────────
  if (status === 'auth_required') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Zap size={24} className="text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invitation OmniFlow</h1>
          <p className="text-gray-400 text-sm mb-6">
            Pour rejoindre l'agence, vous devez d'abord vous connecter ou créer un compte.
          </p>
          {email && (
            <p className="text-xs text-gray-600 mb-5 p-2.5 bg-white/3 border border-white/8 rounded-xl">
              Invitation pour : <strong className="text-gray-300">{email}</strong>
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href={`/login?redirect=/join?invitation=${token}&email=${encodeURIComponent(email)}&agency=${agencyId}`}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              <LogIn size={16} />Se connecter pour accepter
            </Link>
            <Link
              href={`/register?invitation=${token}&email=${encodeURIComponent(email)}&agency=${agencyId}`}
              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-all"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Accepting ──────────────────────────────────────────────
  if (status === 'loading' || status === 'accepting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-8 w-full max-w-md text-center">
          <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Validation de l'invitation...</p>
        </div>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#0f0f1a] border border-green-500/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={24} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invitation acceptée</h1>
          <p className="text-gray-400 text-sm mb-5">
            Vous avez rejoint <strong className="text-white">{agencyName}</strong> avec succès.
            Redirection vers le dashboard...
          </p>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border border-red-500/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Lien invalide</h1>
        <p className="text-gray-400 text-sm mb-5">{message || "Ce lien d'invitation est invalide ou a expiré."}</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
          Retour à la connexion
        </Link>
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
