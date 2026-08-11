import { Plug, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MymConnectionCard } from '@/components/app/settings/MymConnectionCard'

// Phase 14 (Real Platform Integrations), MYM first — spec 47.115's
// Progressive Integration: this page covers Authentication + status. The
// token is entered directly in this page's form and encrypted server-side
// immediately (src/lib/platforms/credentialsActions.ts) — it is never
// pasted into chat/AI conversation, per this project's standing security
// rule for secrets.
export default async function IntegrationsPage() {
  const supabase = await createClient()

  const { data: creators } = await supabase.from('creators').select('id, display_name').order('display_name', { ascending: true })

  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()

  const { data: connections } = mymPlatform
    ? await supabase
        .from('platform_connections')
        .select('creator_id, status, last_synced_at, platform_credentials(last_error)')
        .eq('platform_id', mymPlatform.id)
    : { data: [] }

  const connectionByCreator = new Map(
    (connections ?? []).map((c) => {
      const credRow = c.platform_credentials as unknown as { last_error: string | null }[] | { last_error: string | null } | null
      const lastError = (Array.isArray(credRow) ? credRow[0] : credRow)?.last_error ?? null
      return [
        c.creator_id as string,
        { status: c.status as 'connected' | 'disconnected' | 'error', lastSyncedAt: c.last_synced_at as string | null, lastError },
      ]
    })
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <Plug className="h-5 w-5" />
        <h1 className="text-xl font-semibold">Intégrations</h1>
      </div>

      <div className="glass mb-6 flex items-start gap-3 rounded-2xl p-5 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--cyan)]" />
        <p className="text-[color:var(--foreground-muted)]">
          MYM n&apos;a pas d&apos;API officielle publique — cette connexion utilise le token de session de la créatrice. Pour
          l&apos;instant, seule la <span className="text-[color:var(--foreground)]">lecture</span> des conversations/messages
          réels est branchée ; l&apos;envoi automatique (Copilot, Full AI) reste une étape séparée à venir.
        </p>
      </div>

      {!mymPlatform ? (
        <p className="text-sm text-[color:var(--foreground-muted)]">
          Migration <code>0019_mym_real_connector.sql</code> pas encore appliquée.
        </p>
      ) : (creators ?? []).length === 0 ? (
        <p className="text-sm text-[color:var(--foreground-muted)]">Aucune créatrice.</p>
      ) : (
        <div className="space-y-4">
          {(creators ?? []).map((c) => {
            const conn = connectionByCreator.get(c.id)
            return (
              <MymConnectionCard
                key={c.id}
                creatorId={c.id}
                creatorName={c.display_name}
                status={conn?.status ?? 'none'}
                lastError={conn?.lastError ?? null}
                lastSyncedAt={conn?.lastSyncedAt ?? null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
