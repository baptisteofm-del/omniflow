'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirect = params?.get('redirect') || ''
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      router.push(redirect || '/home')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-1 text-2xl font-semibold">Connexion</h1>
        <p className="mb-6 text-sm text-[color:var(--foreground-muted)]">Content de vous revoir.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--foreground-muted)]">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-[color:var(--cyan)] hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
