'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/dashboard/sidebar/Sidebar'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

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
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

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

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
