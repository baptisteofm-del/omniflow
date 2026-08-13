'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Power, Trash2 } from 'lucide-react'
import { setCreatorFullAiEnabled, setCreatorDefaultAiMode, createKillSwitch, deleteKillSwitch } from '@/lib/ai/agencyAiSettingsActions'

interface CreatorRow {
  id: string
  displayName: string
  fullAiEnabled: boolean
  defaultAiMode: string
}

const MODE_LABELS: Record<string, string> = {
  human_takeover: 'Humain (pas d’IA par défaut)',
  copilot: 'Copilot',
  full_ai: 'Full AI',
}

interface KillSwitchRow {
  id: string
  scope: string
  creatorId: string | null
  actionType: string | null
  reason: string | null
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  send_message: 'Réponses texte',
  send_paid_offer: 'Offres payantes',
}

export function AiSettingsPanel({ creators, killSwitches }: { creators: CreatorRow[]; killSwitches: KillSwitchRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const runAction = (fn: () => Promise<void>) => {
    setError(null)
    startTransition(async () => {
      try {
        await fn()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
    })
  }

  const agencySwitch = killSwitches.find((s) => s.scope === 'agency')

  return (
    <div className="space-y-6">
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}

      <div className="glass rounded-2xl p-5">
        <h2 className="mb-1 text-sm font-semibold">Coupure d&apos;urgence — agence entière</h2>
        <p className="mb-3 text-xs text-[color:var(--foreground-muted)]">
          Désactive Full AI pour toutes les créatrices instantanément (bascule automatique vers Copilot/humain).
        </p>
        {agencySwitch ? (
          <button
            disabled={isPending}
            onClick={() => runAction(() => deleteKillSwitch(agencySwitch.id))}
            className="flex items-center gap-1.5 rounded-full bg-[color:var(--danger)]/15 px-4 py-1.5 text-xs text-[color:var(--danger)] disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
            Coupure active — réactiver Full AI
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              formData.set('scope', 'agency')
              runAction(() => createKillSwitch(formData))
            }}
            className="flex gap-2"
          >
            <input
              name="reason"
              placeholder="Raison (optionnel)"
              className="flex-1 rounded-lg border border-[color:var(--border)] bg-white/5 px-3 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full border border-[color:var(--danger)]/40 px-4 py-1.5 text-xs text-[color:var(--danger)] disabled:opacity-50"
            >
              Tout couper
            </button>
          </form>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="mb-1 text-sm font-semibold">Coupure par type d&apos;action</h2>
        <p className="mb-3 text-xs text-[color:var(--foreground-muted)]">
          Désactive un type d&apos;action précis pour toute l&apos;agence, sans couper le reste.
        </p>
        <div className="space-y-2">
          {(['send_message', 'send_paid_offer'] as const).map((actionType) => {
            const existing = killSwitches.find((s) => s.scope === 'action_type' && s.actionType === actionType)
            return (
              <div key={actionType} className="flex items-center justify-between rounded-lg border border-[color:var(--border)] px-3 py-2 text-xs">
                <span>{ACTION_TYPE_LABELS[actionType]}</span>
                {existing ? (
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => deleteKillSwitch(existing.id))}
                    className="text-[color:var(--danger)] disabled:opacity-50"
                  >
                    Coupé — réactiver
                  </button>
                ) : (
                  <button
                    disabled={isPending}
                    onClick={() => {
                      const formData = new FormData()
                      formData.set('scope', 'action_type')
                      formData.set('action_type', actionType)
                      runAction(() => createKillSwitch(formData))
                    }}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
                  >
                    Couper
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="mb-1 text-sm font-semibold">Par créatrice</h2>
        <p className="mb-3 text-xs text-[color:var(--foreground-muted)]">
          Le mode par défaut s&apos;applique automatiquement à chaque nouvelle conversation de cette créatrice — un chatteur
          n&apos;a ensuite qu&apos;à cliquer « Prendre le contrôle » sur une conversation précise s&apos;il veut intervenir,
          plus besoin de choisir un mode fan par fan.
        </p>
        {creators.length === 0 ? (
          <p className="text-xs text-[color:var(--foreground-muted)]">Aucune créatrice.</p>
        ) : (
          <div className="space-y-2">
            {creators.map((c) => {
              const creatorSwitch = killSwitches.find((s) => s.scope === 'creator' && s.creatorId === c.id)
              return (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[color:var(--border)] px-3 py-2 text-xs">
                  <span className="shrink-0">{c.displayName}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[color:var(--foreground-muted)]">
                      Mode par défaut
                      <select
                        value={c.defaultAiMode}
                        disabled={isPending}
                        onChange={(e) =>
                          runAction(() => setCreatorDefaultAiMode(c.id, e.target.value as 'human_takeover' | 'copilot' | 'full_ai'))
                        }
                        className="rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1 text-xs text-[color:var(--foreground)] focus:border-[color:var(--border-strong)] focus:outline-none"
                      >
                        <option value="human_takeover">{MODE_LABELS.human_takeover}</option>
                        <option value="copilot">{MODE_LABELS.copilot}</option>
                        {c.fullAiEnabled && <option value="full_ai">{MODE_LABELS.full_ai}</option>}
                      </select>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={c.fullAiEnabled}
                        disabled={isPending}
                        onChange={(e) => runAction(() => setCreatorFullAiEnabled(c.id, e.target.checked))}
                      />
                      Full AI activé
                    </label>
                    {creatorSwitch ? (
                      <button
                        disabled={isPending}
                        onClick={() => runAction(() => deleteKillSwitch(creatorSwitch.id))}
                        className="flex items-center gap-1 text-[color:var(--danger)] disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Coupé — réactiver
                      </button>
                    ) : (
                      <button
                        disabled={isPending || !c.fullAiEnabled}
                        onClick={() => {
                          const formData = new FormData()
                          formData.set('scope', 'creator')
                          formData.set('creator_id', c.id)
                          runAction(() => createKillSwitch(formData))
                        }}
                        className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
                      >
                        Couper
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
