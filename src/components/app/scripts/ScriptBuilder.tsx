'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, Loader2, MessageSquare, Wallet, GitBranch, Rocket, Copy } from 'lucide-react'
import {
  addScriptNode,
  updateScriptNode,
  deleteScriptNode,
  setScriptBranch,
  publishScript,
  createNewDraftVersion,
} from '@/lib/scripts/actions'

interface ScriptNode {
  id: string
  node_type: string
  title: string | null
  message_template: string | null
  price_amount: number | null
  currency: string | null
  sequence_order: number
}

interface Branch {
  from_node_id: string
  to_node_id: string
  condition_type: string
}

const NODE_TYPE_LABELS: Record<string, string> = {
  message: 'Message',
  paid_media: 'Offre payante',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  active: 'Actif',
  paused: 'En pause',
  archived: 'Archivé',
}

export function ScriptBuilder({
  scriptId,
  isDraftEditable,
  versionLabel,
  scriptStatus,
  nodes,
  branches,
}: {
  scriptId: string
  isDraftEditable: boolean
  versionLabel: string
  scriptStatus: string
  nodes: ScriptNode[]
  branches: Branch[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [addingType, setAddingType] = useState<'message' | 'paid_media' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const realNodes = nodes.filter((n) => n.node_type === 'message' || n.node_type === 'paid_media')
  const endNode = nodes.find((n) => n.node_type === 'end')

  const branchOptions = [
    ...realNodes.map((n) => ({ id: n.id, label: n.title || NODE_TYPE_LABELS[n.node_type] })),
    ...(endNode ? [{ id: endNode.id, label: 'Fin du script' }] : []),
  ]

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
    <div className="space-y-4">
      <div className="glass flex items-center justify-between rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full border border-[color:var(--border-strong)] px-2.5 py-1 text-xs text-[color:var(--foreground-muted)]">
            {versionLabel}
          </span>
          <span className="text-xs text-[color:var(--foreground-muted)]">{STATUS_LABELS[scriptStatus] ?? scriptStatus}</span>
        </div>
        {isDraftEditable ? (
          <button
            disabled={isPending || realNodes.length === 0}
            onClick={() => runAction(() => publishScript(scriptId))}
            className="gradient-bg-signature flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            Publier
          </button>
        ) : (
          <button
            disabled={isPending}
            onClick={() => runAction(() => createNewDraftVersion(scriptId))}
            className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] px-4 py-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Créer une nouvelle version pour modifier
          </button>
        )}
      </div>

      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}

      <div className="flex justify-center">
        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--foreground-muted)]">Début</span>
      </div>

      {realNodes.length === 0 && (
        <p className="text-center text-sm text-[color:var(--foreground-muted)]">Aucune étape pour l&apos;instant.</p>
      )}

      {realNodes.map((node) => {
        const purchasedBranch = branches.find((b) => b.from_node_id === node.id && b.condition_type === 'purchased')
        const notPurchasedBranch = branches.find((b) => b.from_node_id === node.id && b.condition_type === 'not_purchased')

        return (
          <div key={node.id} className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] px-2.5 py-0.5 text-[10px] text-[color:var(--foreground-muted)]">
                {node.node_type === 'paid_media' ? <Wallet className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                {NODE_TYPE_LABELS[node.node_type]}
                {node.node_type === 'paid_media' && node.price_amount ? ` · ${node.price_amount}€` : ''}
              </span>
              {isDraftEditable && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingNodeId(editingNodeId === node.id ? null : node.id)}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => deleteScriptNode(scriptId, node.id))}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {editingNodeId === node.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  runAction(() => updateScriptNode(scriptId, node.id, formData))
                  setEditingNodeId(null)
                }}
                className="space-y-2"
              >
                <input
                  name="title"
                  defaultValue={node.title ?? ''}
                  placeholder="Titre (optionnel)"
                  className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                />
                <textarea
                  name="message_template"
                  required
                  defaultValue={node.message_template ?? ''}
                  rows={3}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                />
                {node.node_type === 'paid_media' && (
                  <input
                    type="number"
                    name="price_amount"
                    required
                    defaultValue={node.price_amount ?? ''}
                    placeholder="Prix (€)"
                    className="w-32 rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="gradient-bg-signature rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNodeId(null)}
                    className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <>
                {node.title && <p className="mb-1 text-xs font-medium">{node.title}</p>}
                <p className="text-sm text-[color:var(--foreground-muted)]">{node.message_template}</p>
              </>
            )}

            {node.node_type === 'paid_media' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  formData.set('node_id', node.id)
                  runAction(() => setScriptBranch(scriptId, formData))
                }}
                className="mt-3 space-y-2 rounded-xl border border-[color:var(--border)] p-3"
              >
                <p className="flex items-center gap-1.5 text-[10px] text-[color:var(--foreground-muted)]">
                  <GitBranch className="h-3 w-3" />
                  Branches
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Si acheté →</label>
                    <select
                      name="purchased_target"
                      defaultValue={purchasedBranch?.to_node_id ?? ''}
                      disabled={!isDraftEditable}
                      className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">— non défini —</option>
                      {branchOptions
                        .filter((o) => o.id !== node.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Si refusé →</label>
                    <select
                      name="not_purchased_target"
                      defaultValue={notPurchasedBranch?.to_node_id ?? ''}
                      disabled={!isDraftEditable}
                      className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">— non défini —</option>
                      {branchOptions
                        .filter((o) => o.id !== node.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                {isDraftEditable && (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg border border-[color:var(--border-strong)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
                  >
                    Enregistrer les branches
                  </button>
                )}
              </form>
            )}
          </div>
        )
      })}

      <div className="flex justify-center">
        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--foreground-muted)]">Fin</span>
      </div>

      {isDraftEditable && (
        <div className="glass rounded-2xl p-4">
          {!addingType ? (
            <div className="flex gap-2">
              <button
                onClick={() => setAddingType('message')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[color:var(--border-strong)] px-3 py-2 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter un message
              </button>
              <button
                onClick={() => setAddingType('paid_media')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[color:var(--border-strong)] px-3 py-2 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter une offre payante
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                runAction(() => addScriptNode(scriptId, formData))
                setAddingType(null)
                e.currentTarget.reset()
              }}
              className="space-y-2"
            >
              <input type="hidden" name="node_type" value={addingType} />
              <input
                name="title"
                placeholder="Titre (optionnel)"
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              />
              <textarea
                name="message_template"
                required
                rows={3}
                placeholder="Message envoyé au fan..."
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              />
              {addingType === 'paid_media' && (
                <input
                  type="number"
                  name="price_amount"
                  required
                  placeholder="Prix (€)"
                  className="w-32 rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                />
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="gradient-bg-signature rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddingType(null)}
                  className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
