'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, X, Copy, Check } from 'lucide-react'
import { inviteTeamMember, revokeInvitation, changeMemberRole, removeMember } from '@/lib/team/actions'

interface Member {
  id: string
  userId: string
  name: string
  email: string
  roleId: string
  roleName: string
  status: string
}

interface Invitation {
  id: string
  email: string
  roleName: string
  token: string
  createdAt: string
}

export function TeamManager({
  members,
  invitations,
  roles,
}: {
  members: Member[]
  invitations: Invitation[]
  roles: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const copyInviteLink = (token: string, id: string) => {
    const url = `${window.location.origin}/join?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="h-4 w-4" />
          Inviter un membre
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            runAction(async () => {
              await inviteTeamMember(formData)
              ;(e.target as HTMLFormElement).reset()
            })
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            name="email"
            type="email"
            required
            placeholder="email@exemple.com"
            className="min-w-[200px] flex-1 rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
          />
          <select
            name="role_id"
            required
            defaultValue=""
            className="rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
          >
            <option value="" disabled>
              Rôle
            </option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="gradient-bg-signature flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Inviter'}
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-[color:var(--danger)]">{error}</p>}
      </div>

      {invitations.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Invitations en attente</h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{inv.email}</p>
                  <p className="text-xs text-[color:var(--foreground-muted)]">{inv.roleName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => copyInviteLink(inv.token, inv.id)}
                    title="Copier le lien d'invitation"
                    className="flex items-center gap-1 rounded-full border border-[color:var(--border-strong)] px-2.5 py-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                  >
                    {copiedId === inv.id ? <Check className="h-3 w-3 text-[color:var(--success)]" /> : <Copy className="h-3 w-3" />}
                    {copiedId === inv.id ? 'Copié' : 'Copier le lien'}
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => revokeInvitation(inv.id))}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-semibold">Membres ({members.length})</h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-xs text-[color:var(--foreground-muted)]">{m.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  disabled={isPending}
                  value={m.roleId}
                  onChange={(e) => runAction(() => changeMemberRole(m.id, e.target.value))}
                  className="rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1 text-xs focus:border-[color:var(--border-strong)] focus:outline-none disabled:opacity-50"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={isPending}
                  onClick={() => runAction(() => removeMember(m.id))}
                  title="Retirer de l'agence"
                  className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
