import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AiSettingsPanel } from '@/components/app/settings/AiSettingsPanel'

// Agency Settings — AI Control Center (spec Part 10): where an agency turns
// Full AI on per creator, and where the Kill Switch (spec 10.29/4.29) lives —
// agency-wide, per-creator, and per-action-type. No self-serve global switch
// (that level is internal-OmniFlow only); a global row is still surfaced
// read-only if one ever exists, via the banner below.
export default async function AiSettingsPage() {
  const supabase = await createClient()

  const { data: creators } = await supabase
    .from('creators')
    .select('id, display_name, creator_commercial_settings(full_ai_enabled)')
    .order('display_name', { ascending: true })

  const { data: switches } = await supabase
    .from('ai_kill_switches')
    .select('id, scope, creator_id, action_type, reason, created_at')
    .order('created_at', { ascending: false })

  const globalSwitch = (switches ?? []).find((s) => s.scope === 'global')
  const agencySwitches = (switches ?? []).filter((s) => s.scope !== 'global')

  const creatorRows = (creators ?? []).map((c) => {
    const settings = c.creator_commercial_settings as unknown as { full_ai_enabled: boolean }[] | { full_ai_enabled: boolean } | null
    const row = Array.isArray(settings) ? settings[0] : settings
    return { id: c.id as string, displayName: c.display_name as string, fullAiEnabled: row?.full_ai_enabled ?? false }
  })

  const killSwitchRows = agencySwitches.map((s) => ({
    id: s.id as string,
    scope: s.scope as string,
    creatorId: s.creator_id as string | null,
    actionType: s.action_type as string | null,
    reason: s.reason as string | null,
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Paramètres IA</h1>
      <p className="mb-8 text-sm text-[color:var(--foreground-muted)]">
        Activation Full AI par créatrice et coupures d&apos;urgence (spec Part 10).
      </p>

      {globalSwitch && (
        <div className="glass mb-6 flex items-center gap-2 rounded-2xl border border-[color:var(--danger)]/40 p-4 text-sm text-[color:var(--danger)]">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Full AI est coupé globalement par OmniFlow{globalSwitch.reason ? ` — ${globalSwitch.reason}` : ''}. Aucune action Full AI
          ne peut s&apos;exécuter tant que cette coupure est active.
        </div>
      )}

      {!globalSwitch && (
        <div className="glass mb-6 flex items-center gap-2 rounded-2xl p-4 text-sm text-[color:var(--foreground-muted)]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--success)]" />
          Aucune coupure globale active.
        </div>
      )}

      <AiSettingsPanel creators={creatorRows} killSwitches={killSwitchRows} />
    </div>
  )
}
