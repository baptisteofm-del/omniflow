'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, Plus, Trash2 } from 'lucide-react'
import { createCustomRole, deleteCustomRole } from '@/lib/team/actions'

interface Permission {
  id: string
  key: string
  description: string | null
}

interface RoleWithPermissions {
  id: string
  name: string
  permissionIds: string[]
}

export function RolesPanel({
  systemRoles,
  customRoles,
  permissions,
}: {
  systemRoles: RoleWithPermissions[]
  customRoles: RoleWithPermissions[]
  permissions: Permission[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const permissionById = new Map(permissions.map((p) => [p.id, p]))

  const runAction = (fn: () => Promise<void>) => {
    setError(null)
    startTransition(async () => {
      try {
        await fn()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
      router.refresh()
    })
  }

  const renderPermissionChips = (ids: string[]) => (
    <div className="flex flex-wrap gap-1">
      {ids.length === 0 && <span className="text-[10px] text-[color:var(--foreground-muted)]">Aucune fonctionnalité</span>}
      {ids.map((id) => {
        const p = permissionById.get(id)
        if (!p) return null
        return (
          <span key={id} className="rounded-full border border-[color:var(--border-strong)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)]">
            {p.description || p.key}
          </span>
        )
      })}
    </div>
  )

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Rôles et fonctionnalités
        </h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Créer un rôle personnalisé
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-xs text-[color:var(--danger)]">{error}</p>}

      {creating && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            runAction(async () => {
              await createCustomRole(formData)
              setCreating(false)
            })
          }}
          className="mb-4 space-y-3 rounded-xl border border-[color:var(--border)] p-4"
        >
          <input
            name="name"
            required
            placeholder="Nom du rôle (ex: Assistante marketing)"
            className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
          />
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {permissions.map((p) => (
              <label key={p.id} className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-2 text-xs">
                <input type="checkbox" name="permissions" value={p.key} className="h-3.5 w-3.5 accent-[color:var(--violet)]" />
                {p.description || p.key}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="gradient-bg-signature flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs text-white disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Créer'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-lg border border-[color:var(--border)] px-4 py-1.5 text-xs text-[color:var(--foreground-muted)]"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {customRoles.map((r) => (
          <div key={r.id} className="rounded-xl border border-[color:var(--border)] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium">{r.name}</span>
              <button
                disabled={isPending}
                onClick={() => runAction(() => deleteCustomRole(r.id))}
                className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {renderPermissionChips(r.permissionIds)}
          </div>
        ))}

        {systemRoles.map((r) => (
          <div key={r.id} className="rounded-xl border border-[color:var(--border)] p-3 opacity-80">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium">{r.name}</span>
              <span className="text-[9px] text-[color:var(--foreground-muted)]">Rôle standard</span>
            </div>
            {renderPermissionChips(r.permissionIds)}
          </div>
        ))}
      </div>
    </div>
  )
}
