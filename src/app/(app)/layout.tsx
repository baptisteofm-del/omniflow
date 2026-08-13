import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/app/Sidebar'
import { TopBar } from '@/components/app/TopBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Owner report: "partout c'est lent" — this layout wraps every single
  // page in the app, and used to make 2 sequential round-trips here (users,
  // then agency_memberships) on every navigation, on top of auth.getUser()
  // and the notifications fetch below. The FK from agency_memberships to
  // users lets Postgres do that join in one query instead.
  //
  // BUG FIX (owner report: "Accès restreint" on every page after this
  // shipped): agency_memberships has TWO foreign keys to users (user_id AND
  // invited_by), so the embed below was ambiguous — Postgres couldn't tell
  // which one to join on, silently returning no rows instead of an error.
  // `!user_id` pins it to the right one.
  const { data: appUser } = await supabase
    .from('users')
    .select('id, display_name, email, agency_memberships!user_id(agency_id, status, agencies(name))')
    .eq('auth_user_id', authUser.id)
    .single()

  let agencyName: string | null = null
  let agencyId: string | null = null
  if (appUser) {
    const memberships = (appUser.agency_memberships ?? []) as unknown as {
      agency_id: string
      status: string
      agencies: { name: string } | null
    }[]
    const membership = memberships.find((m) => m.status === 'active') ?? null
    agencyName = membership?.agencies?.name ?? null
    agencyId = membership?.agency_id ?? null
  }

  const { data: notifications } = agencyId
    ? await supabase
        .from('agency_notifications')
        .select('id, type, title, body, conversation_id, read_at, created_at')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })
        .limit(30)
    : { data: [] }

  const userName = appUser?.display_name || appUser?.email || 'Membre'

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <TopBar agencyId={agencyId} initialNotifications={notifications ?? []} userName={userName} userRole={null} />
      {/* pt-14: TopBar is fixed (h-14), so the row below needs the same
          top offset reserved in normal flow — Sidebar itself is also
          fixed and starts its own box at top-14 to match. */}
      <div className="flex pt-14">
        <Sidebar agencyName={agencyName} />
        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
