'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Écoute les changements d'état auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        router.replace('/dashboard')
      }
    })

    // Vérifier si déjà connecté
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace('/dashboard')
      }
    })

    // Détecter manuellement le hash dans l'URL (fallback)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('access_token') || hash.includes('code=')) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) router.replace('/dashboard')
        })
      }
    }

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
