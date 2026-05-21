import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If onboarding is already completed, redirect to dashboard
  const { data: agency } = await supabase
    .from('agencies')
    .select('onboarding_completed')
    .eq('owner_id', user.id)
    .single()

  if (agency?.onboarding_completed) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
