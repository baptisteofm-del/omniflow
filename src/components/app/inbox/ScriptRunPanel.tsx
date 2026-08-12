'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Workflow, Square, Loader2, Clock } from 'lucide-react'
import { startScriptRun, stopScriptRun } from '@/lib/scripts/actions'

export interface ActiveRun {
  id: string
  scriptName: string
  currentNodeTitle: string | null
  scheduledAt: string | null
}

export interface AvailableScript {
  id: string
  name: string
}

export function ScriptRunPanel({
  conversationId,
  activeRun,
  availableScripts,
}: {
  conversationId: string
  activeRun: ActiveRun | null
  availableScripts: AvailableScript[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedScript, setSelectedScript] = useState(availableScripts[0]?.id ?? '')
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

  const secondsUntilScheduled =
    activeRun?.scheduledAt && new Date(activeRun.scheduledAt).getTime() > Date.now()
      ? Math.round((new Date(activeRun.scheduledAt).getTime() - Date.now()) / 1000)
      : null

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Workflow className="h-4 w-4" />
        Script
      </div>

      {error && <p className="mb-2 text-xs text-[color:var(--danger)]">{error}</p>}

      {activeRun ? (
        <div className="space-y-2">
          <p className="text-xs text-[color:var(--foreground-muted)]">
            <span className="text-[color:var(--foreground)]">{activeRun.scriptName}</span> — en cours
          </p>
          {activeRun.currentNodeTitle && (
            <p className="text-xs text-[color:var(--foreground-muted)]">Étape : {activeRun.currentNodeTitle}</p>
          )}
          {secondsUntilScheduled !== null && (
            <p className="flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)]">
              <Clock className="h-3 w-3" />
              Envoi dans ~{secondsUntilScheduled}s (recharge la page pour vérifier)
            </p>
          )}
          <button
            disabled={isPending}
            onClick={() => runAction(() => stopScriptRun(conversationId, activeRun.id))}
            className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
            Arrêter
          </button>
        </div>
      ) : availableScripts.length === 0 ? (
        <p className="text-xs text-[color:var(--foreground-muted)]">Aucun script publié pour cette créatrice.</p>
      ) : (
        <div className="flex gap-2">
          <select
            value={selectedScript}
            onChange={(e) => setSelectedScript(e.target.value)}
            className="flex-1 rounded-xl border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
          >
            {availableScripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            disabled={isPending || !selectedScript}
            onClick={() => runAction(() => startScriptRun(conversationId, selectedScript))}
            className="gradient-bg-signature rounded-xl px-3 py-1.5 text-xs text-white disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Lancer'}
          </button>
        </div>
      )}
    </div>
  )
}
