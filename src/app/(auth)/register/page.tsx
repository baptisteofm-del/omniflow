'use client'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const VALID_PLANS = ['copilot', 'full_ai']

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const requestedPlan = params.get('plan') || 'copilot'
  const plan = VALID_PLANS.includes(requestedPlan) ? requestedPlan : 'copilot'

  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ agencyName: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            agency_name: form.agencyName,
            plan_id: plan,
          },
        },
      })
      if (error) throw error

      toast.success('Compte créé ! Vérifiez votre email pour confirmer.')
      router.push('/home')
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-1 text-2xl font-semibold">Créer votre compte</h1>
        <p className="mb-6 text-sm text-[color:var(--foreground-muted)]">
          Accédez à OmniFlow {plan === 'full_ai' ? 'Full AI' : 'Copilot'} dès votre inscription.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-[color:var(--foreground-muted)]">Nom de l&apos;agence</label>
            <input
              type="text"
              required
              value={form.agencyName}
              onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
              placeholder="Mon Agence"
              className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--foreground)] placeholder-[color:var(--foreground-muted)] transition-colors focus:border-[color:var(--border-strong)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[color:var(--foreground-muted)]">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@monagence.com"
              className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--foreground)] placeholder-[color:var(--foreground-muted)] transition-colors focus:border-[color:var(--border-strong)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[color:var(--foreground-muted)]">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 caractères"
                className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3 pr-12 text-sm text-[color:var(--foreground)] placeholder-[color:var(--foreground-muted)] transition-colors focus:border-[color:var(--border-strong)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-bg-signature mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--foreground-muted)]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[color:var(--cyan)] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="glass h-96 w-full max-w-md animate-pulse rounded-2xl" />}>
      <RegisterForm />
    </Suspense>
  )
}
