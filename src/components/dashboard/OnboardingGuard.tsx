'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: agency } = await supabase
          .from('agencies')
          .select('onboarding_completed')
          .eq('owner_id', user.id)
          .single()

        if (agency && !agency.onboarding_completed) {
          setIsOnboardingComplete(false)
          // Only redirect if not already on onboarding page
          if (!pathname.includes('/onboarding')) {
            router.push('/onboarding')
          }
        } else {
          setIsOnboardingComplete(true)
        }
      } catch (error) {
        console.error('Error checking onboarding:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [supabase, router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
