import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/app/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('id, display_name, email')
    .eq('auth_user_id', authUser.id)
    .single()

  let agencyName: string | null = null
  if (appUser) {
    const { data: membership } = await supabase
      .from('agency_memberships')
      .select('agencies(name)')
      .eq('user_id', appUser.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
    agencyName = (membership?.agencies as unknown as { name: string } | null)?.name ?? null
  }

  return (
    <div className="flex min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar agencyName={agencyName} />
      <main className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
