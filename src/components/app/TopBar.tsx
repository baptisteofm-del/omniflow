import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { NotificationBell } from '@/components/app/NotificationBell'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  conversation_id: string | null
  read_at: string | null
  created_at: string
}

// Design handoff reference put the logo, a global Copilot IA quick-access,
// notifications, and the signed-in user's identity in a full-width bar
// above everything — this app had none of that (logo lived inside the
// narrow Sidebar rail, notifications too, no user identity shown anywhere).
export function TopBar({
  agencyId,
  initialNotifications,
  userName,
  userRole,
}: {
  agencyId: string | null
  initialNotifications: Notification[]
  userName: string
  userRole: string | null
}) {
  const initial = userName.trim().charAt(0).toUpperCase() || '?'

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5">
      <Link href="/home" className="flex items-center gap-2">
        <div className="gradient-bg-signature glow-sm flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Image src="/logo-mark.png" alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0 rounded-full" />
        </div>
        <span className="whitespace-nowrap font-semibold">
          Omni<span className="gradient-text">Flow</span>
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="gradient-bg-signature flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)] transition-transform hover:scale-[1.03]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Copilot IA
        </Link>
        {agencyId && <NotificationBell agencyId={agencyId} initialNotifications={initialNotifications} />}
        <div className="flex items-center gap-2 border-l border-[color:var(--border)] pl-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-elevated)] text-xs font-semibold">
            {initial}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="truncate text-xs font-medium">{userName}</p>
            {userRole && <p className="truncate text-[10px] text-[color:var(--foreground-muted)]">{userRole}</p>}
          </div>
        </div>
      </div>
    </header>
  )
}
