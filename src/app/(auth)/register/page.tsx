'use client'
import Link from 'next/link'
import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plan         = params.get('plan') || 'starter'
  const inviteToken  = params.get('invitation') || ''
  const inviteEmail  = params.get('email') || ''
  const inviteAgency = params.get('agency') || ''
  const isInvited    = Boolean(inviteToken && inviteAgency)

  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    agencyName: '',
    email: inviteEmail || '',
    password: '',
  })

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const refCookie = cookies.find(c => c.trim().startsWith('referral_code='))
    if (refCookie) setReferralCode(refCookie.split('=')[1])
  }, [])

  // ── Flux invité : création via API admin + connexion directe ──
  const handleInvitedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Étape 1 : créer le compte côté serveur (email auto-confirmé, invitation acceptée)
      const res = await fetch('/api/auth/invite-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          token: inviteToken,
          agencyId: inviteAgency,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du compte')

      // Étape 2 : connexion immédiate (email confirmé → fonctionne toujours)
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError) throw new Error('Compte créé mais connexion échouée. Essayez de vous connecter manuellement.')

      setSuccess(true)
      toast.success(`Bienvenue dans ${data.agencyName || "l'équipe"} ! 🎉`)

      // Étape 3 : redirection directe vers le dashboard
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  // ── Flux standard : création d'agence ─────────────────────
  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            agency_name: form.agencyName || null,
            plan_id: plan,
            referred_by: referralCode || null,
            is_team_member: false,
          },
        },
      })
      if (error) throw error

      try {
        await fetch('/api/email/drip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, agencyName: form.agencyName, day: 0 }),
        })
      } catch {}

      toast.success('Compte créé ! Vérifiez votre email pour confirmer.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  // ── Affichage succès invitation ────────────────────────────
  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 text-center border border-green-500/20">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Vous avez rejoint l'équipe !</h2>
          <p className="text-gray-400 text-sm">Redirection vers votre dashboard...</p>
          <Loader2 size={20} className="animate-spin text-purple-400 mx-auto mt-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl p-8">

        {isInvited ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus size={20} className="text-purple-400" />
              <h1 className="text-2xl font-bold">Rejoindre l'équipe</h1>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Créez votre compte pour accepter l'invitation.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Créer votre compte</h1>
            <p className="text-gray-400 text-sm mb-6">
              Accédez à toutes les fonctionnalités dès votre inscription
            </p>
          </>
        )}

        <form onSubmit={isInvited ? handleInvitedSubmit : handleOwnerSubmit} className="space-y-4">

          {/* Nom : uniquement pour les invités */}
          {isInvited && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Votre nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
          )}

          {/* Nom d'agence : uniquement pour les nouveaux owners */}
          {!isInvited && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nom de l'agence</label>
              <input
                type="text"
                required
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                placeholder="Mon Agence OF"
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@monagence.com"
              readOnly={isInvited && Boolean(inviteEmail)}
              className={`w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors ${isInvited && inviteEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            {isInvited && inviteEmail && (
              <p className="text-xs text-gray-500 mt-1.5">Email pré-rempli depuis votre invitation</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 caractères"
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading
              ? (isInvited ? 'Création du compte...' : 'Création...')
              : (isInvited ? 'Créer mon compte et rejoindre' : 'Créer mon compte')
            }
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Déjà un compte ?{' '}
          <Link
            href={isInvited
              ? `/login?redirect=${encodeURIComponent(`/join?invitation=${inviteToken}&email=${encodeURIComponent(inviteEmail)}&agency=${inviteAgency}`)}`
              : '/login'
            }
            className="text-purple-400 hover:text-purple-300"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md glass rounded-2xl p-8 animate-pulse h-96" />}>
      <RegisterForm />
    </Suspense>
  )
}
