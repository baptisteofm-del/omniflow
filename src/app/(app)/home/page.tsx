import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Construction } from 'lucide-react'

const UPCOMING = ['Inbox', 'Fans', 'Scripts', 'Média', 'Relances', 'Analytics', 'Créatrices', 'Équipe', 'Intégrations', 'Facturation']

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('auth_user_id', authUser!.id)
    .single()

  const { data: membership } = await supabase
    .from('agency_memberships')
    .select('role_id, agencies(name, plan_id), roles(name)')
    .eq('user_id', appUser?.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  const agency = membership?.agencies as unknown as { name: string; plan_id: string } | null
  const role = membership?.roles as unknown as { name: string } | null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass mb-8 flex items-start gap-3 rounded-2xl p-6">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--success)]" />
        <div>
          <h1 className="text-lg font-semibold">Bienvenue{appUser?.display_name ? `, ${appUser.display_name}` : ''}</h1>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
            Votre compte et votre agence <span className="text-[color:var(--foreground)]">{agency?.name ?? '—'}</span> sont
            créés. Plan : <span className="text-[color:var(--foreground)]">{agency?.plan_id === 'full_ai' ? 'Full AI' : 'Copilot'}</span> ·
            Rôle : <span className="text-[color:var(--foreground)]">{role?.name ?? '—'}</span>
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-3 flex items-center gap-2 text-sm text-[color:var(--foreground-muted)]">
          <Construction className="h-4 w-4" />
          En construction
        </div>
        <p className="text-sm text-[color:var(--foreground-muted)]">
          L&apos;espace de travail complet arrive dans les prochaines étapes : configuration de vos
          créatrices, chatting Copilot/Full AI, scripts, analytics...
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {UPCOMING.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--foreground-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
