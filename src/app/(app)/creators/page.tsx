import Link from 'next/link'
import { Plus, UserRound } from 'lucide-react'
import { checkPageAccess } from '@/lib/permissions/check'
import { AccessRestricted } from '@/components/app/AccessRestricted'

export default async function CreatorsPage() {
  const { supabase, allowed } = await checkPageAccess('creator.view')
  if (!allowed) return <AccessRestricted feature="les Créatrices" />

  const { data: creators } = await supabase
    .from('creators')
    .select('id, display_name, status, default_language, avatar_url, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Créatrices</h1>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
            Les créatrices gérées par votre agence.
          </p>
        </div>
        <Link
          href="/creators/new"
          className="gradient-bg-signature inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Nouvelle créatrice
        </Link>
      </div>

      {!creators || creators.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
            <UserRound className="h-6 w-6 text-[color:var(--cyan)]" />
          </div>
          <h2 className="text-base font-semibold">Aucune créatrice pour l&apos;instant</h2>
          <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
            Ajoutez votre première créatrice pour configurer son Model DNA et ses réglages commerciaux.
          </p>
          <Link
            href="/creators/new"
            className="gradient-bg-signature mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter une créatrice
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c) => (
            <Link key={c.id} href={`/creators/${c.id}`} className="glass rounded-2xl p-5 transition-colors hover:bg-white/5">
              {c.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar_url} alt={c.display_name} className="mb-3 h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
                  <UserRound className="h-5 w-5 text-[color:var(--cyan)]" />
                </div>
              )}
              <h3 className="font-medium">{c.display_name}</h3>
              <p className="mt-1 text-xs text-[color:var(--foreground-muted)]">
                {c.status === 'ready' ? 'Prête' : c.status} · {c.default_language.toUpperCase()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
