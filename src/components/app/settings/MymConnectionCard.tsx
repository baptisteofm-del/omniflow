'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, RefreshCw, Unplug } from 'lucide-react'
import { connectMymCreator, disconnectMymCreator } from '@/lib/platforms/credentialsActions'
import { syncMymCreator } from '@/lib/platforms/sync'

interface Props {
  creatorId: string
  creatorName: string
  status: 'connected' | 'disconnected' | 'error' | 'none'
  lastError: string | null
  lastSyncedAt: string | null
}

export function MymConnectionCard({ creatorId, creatorName, status, lastError, lastSyncedAt }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(status !== 'connected')

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

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{creatorName}</span>
          {status === 'connected' && (
            <span className="flex items-center gap-1 text-xs text-[color:var(--success)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connecté
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 text-xs text-[color:var(--danger)]">
              <XCircle className="h-3.5 w-3.5" />
              Erreur de connexion
            </span>
          )}
          {status === 'disconnected' && <span className="text-xs text-[color:var(--foreground-muted)]">Déconnecté</span>}
          {status === 'none' && <span className="text-xs text-[color:var(--foreground-muted)]">Jamais connecté</span>}
        </div>
        {status === 'connected' && (
          <div className="flex gap-2">
            <button
              disabled={isPending}
              onClick={() => {
                setSyncResult(null)
                runAction(async () => {
                  const result = await syncMymCreator(creatorId)
                  setSyncResult(`${result.conversationsSynced} conversation(s), ${result.messagesSynced} nouveau(x) message(s)`)
                })
              }}
              className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Synchroniser
            </button>
            <button
              disabled={isPending}
              onClick={() => runAction(() => disconnectMymCreator(creatorId))}
              className="flex items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
            >
              <Unplug className="h-3.5 w-3.5" />
              Déconnecter
            </button>
          </div>
        )}
      </div>

      {lastError && status === 'error' && <p className="mb-2 text-xs text-[color:var(--danger)]">{lastError}</p>}
      {lastSyncedAt && <p className="mb-2 text-[10px] text-[color:var(--foreground-muted)]">Dernière synchro : {new Date(lastSyncedAt).toLocaleString('fr-FR')}</p>}
      {syncResult && <p className="mb-2 text-xs text-[color:var(--success)]">{syncResult}</p>}
      {error && <p className="mb-2 text-xs text-[color:var(--danger)]">{error}</p>}

      {status === 'connected' && !showForm ? (
        <button onClick={() => setShowForm(true)} className="text-[10px] text-[color:var(--foreground-muted)] underline">
          Remplacer les identifiants
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            runAction(async () => {
              await connectMymCreator(creatorId, formData)
              setShowForm(false)
            })
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <input
              name="email"
              type="email"
              required
              placeholder="Email MYM de la créatrice"
              className="flex-1 rounded-lg border border-[color:var(--border)] bg-white/5 px-3 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Mot de passe MYM"
              className="flex-1 rounded-lg border border-[color:var(--border)] bg-white/5 px-3 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="gradient-bg-signature flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs text-white disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Connecter'}
          </button>
        </form>
      )}
    </div>
  )
}
