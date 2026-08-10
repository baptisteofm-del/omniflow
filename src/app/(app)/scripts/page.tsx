import Link from 'next/link'
import { Plus, Workflow } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  active: 'Actif',
  paused: 'En pause',
  archived: 'Archivé',
}

export default async function ScriptsPage() {
  const supabase = await createClient()
  const { data: scripts } = await supabase
    .from('scripts')
    .select('id, name, description, status, creators(display_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Scripts</h1>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
            Scénarios commerciaux structurés : messages, offres, branches achat / non-achat.
          </p>
        </div>
        <Link
          href="/scripts/new"
          className="gradient-bg-signature inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Nouveau script
        </Link>
      </div>

      {!scripts || scripts.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
            <Workflow className="h-6 w-6 text-[color:var(--cyan)]" />
          </div>
          <h2 className="text-base font-semibold">Aucun script pour l&apos;instant</h2>
          <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
            Créez un scénario avec des étapes, des offres payantes et des branches selon l&apos;achat ou non.
          </p>
          <Link
            href="/scripts/new"
            className="gradient-bg-signature mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Créer un script
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scripts.map((s) => {
            const creator = s.creators as unknown as { display_name: string } | null
            return (
              <Link key={s.id} href={`/scripts/${s.id}`} className="glass rounded-2xl p-5 transition-transform hover:scale-[1.01]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
                  <Workflow className="h-5 w-5 text-[color:var(--cyan)]" />
                </div>
                <h3 className="font-medium">{s.name}</h3>
                <p className="mt-1 text-xs text-[color:var(--foreground-muted)]">
                  {STATUS_LABELS[s.status] ?? s.status} · {creator?.display_name ?? 'Toutes les créatrices'}
                </p>
                {s.description && <p className="mt-2 text-xs text-[color:var(--foreground-muted)]">{s.description}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
