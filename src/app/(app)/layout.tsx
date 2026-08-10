import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/app/SignOutButton'

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
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="" width={24} height={24} className="h-6 w-6 rounded-full" />
            <span className="font-semibold">
              Omni<span className="gradient-text">Flow</span>
            </span>
            {agencyName && (
              <>
                <span className="text-[color:var(--foreground-muted)]">/</span>
                <span className="text-sm text-[color:var(--foreground-muted)]">{agencyName}</span>
              </>
            )}
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  )
}
