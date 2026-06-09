'use client'
import Link from 'next/link'
import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
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
  const [form, setForm] = useState({
    agencyName: '',
    email: inviteEmail || '',
    password: '',
  })

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const refCookie = cookies.find(c => c.trim().startsWith('referral_code='))
    if (refCookie) setReferralCode(refCookie.split('=')[1])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    try {
      const signupOptions: any = {
        email: form.email,
        password: form.password,
        options: {
          data: {
            // Pour les invités : pas d'agencyName propre, ils rejoignent une agence existante
            agency_name: isInvited ? null : (form.agencyName || null),
            plan_id: isInvited ? null : plan,
            referred_by: referralCode || null,
            is_team_member: isInvited,
          },
        },
      }

      const { error } = await supabase.auth.signUp(signupOptions)
      if (error) throw error

      if (!isInvited) {
        // Envoyer l'email de bienvenue uniquement pour les nouveaux owners
        try {
          await fetch('/api/email/drip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, agencyName: form.agencyName, day: 0 }),
          })
        } catch {}
      }

      toast.success('Compte créé ! Connexion en cours...')

      if (isInvited) {
        // Rediriger vers la page d'acceptation avec tous les params d'invitation
        router.push(
          `/join?invitation=${inviteToken}&email=${encodeURIComponent(inviteEmail)}&agency=${inviteAgency}`
        )
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
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
              7 jours d'essai gratuit • Sans carte bancaire
            </p>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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
              // Si invité avec email pré-rempli, le rendre readonly
              readOnly={isInvited && Boolean(inviteEmail)}
              className={`w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors ${isInvited && inviteEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
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
            {loading ? 'Création...' : isInvited ? "Créer mon compte et rejoindre" : "Créer mon compte"}
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
