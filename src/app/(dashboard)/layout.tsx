'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/dashboard/sidebar/Sidebar'
import { NotificationBell } from '@/components/dashboard/header/NotificationBell'
import { TutorialProvider, TutorialTooltip, TutorialButton } from '@/components/dashboard/tutorial'
import { SupportChat } from '@/components/shared/SupportChat'
import { InstallPWA } from '@/components/shared/InstallPWA'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: agency } = await supabase
        .from('agencies')
        .select('id, onboarding_completed')
        .eq('owner_id', user.id)
        .single()

      if (agency && !agency.onboarding_completed) {
        router.push('/onboarding')
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <TutorialProvider>
      <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with notifications */}
          <header className="h-14 lg:h-16 border-b border-purple-500/20 flex items-center justify-end px-4 lg:px-8 bg-white/5 backdrop-blur gap-4">
            <TutorialButton />
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
      <TutorialTooltip />
      <SupportChat />
      <InstallPWA />
    </TutorialProvider>
  )
}
