'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Loader2, ImageIcon, Video, Music } from 'lucide-react'
import { updateMediaAsset } from '@/lib/media/actions'

interface Asset {
  id: string
  title: string
  description: string | null
  media_type: string
  status: string
  target_price: number
  minimum_price: number
  currency: string
  standalone_allowed: boolean
  signedUrl: string | null
  creatorName: string | null
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  paused: 'En pause',
  archived: 'Archivé',
}

const TYPE_ICONS: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
}

export function MediaCard({ asset }: { asset: Asset }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const TypeIcon = TYPE_ICONS[asset.media_type] ?? ImageIcon

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
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex h-36 items-center justify-center bg-[color:var(--surface-elevated)]">
        {asset.media_type === 'image' && asset.signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.signedUrl} alt={asset.title} className="h-full w-full object-cover" />
        ) : (
          <TypeIcon className="h-8 w-8 text-[color:var(--foreground-muted)]" />
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full border border-[color:var(--border-strong)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)]">
            {STATUS_LABELS[asset.status] ?? asset.status}
          </span>
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        {!editing ? (
          <>
            <h3 className="font-medium">{asset.title}</h3>
            <p className="mt-0.5 text-xs text-[color:var(--foreground-muted)]">{asset.creatorName}</p>
            {asset.description && <p className="mt-1 text-xs text-[color:var(--foreground-muted)]">{asset.description}</p>}
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="gradient-text font-semibold">{asset.target_price}€</span>
              <span className="text-[color:var(--foreground-muted)]">min. {asset.minimum_price}€</span>
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              runAction(() => updateMediaAsset(asset.id, formData))
              setEditing(false)
            }}
            className="space-y-2"
          >
            <input
              name="title"
              required
              defaultValue={asset.title}
              className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
            />
            <textarea
              name="description"
              defaultValue={asset.description ?? ''}
              rows={2}
              placeholder="Description (optionnel)"
              className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="target_price"
                required
                defaultValue={asset.target_price}
                placeholder="Prix cible"
                className="w-1/2 rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              />
              <input
                type="number"
                name="minimum_price"
                required
                defaultValue={asset.minimum_price}
                placeholder="Prix minimum"
                className="w-1/2 rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              />
            </div>
            <select
              name="status"
              defaultValue={asset.status}
              className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
            >
              <option value="active">Actif</option>
              <option value="paused">En pause</option>
              <option value="archived">Archivé</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-[color:var(--foreground-muted)]">
              <input type="checkbox" name="standalone_allowed" defaultChecked={asset.standalone_allowed} />
              Utilisable hors script
            </label>
            {error && <p className="text-[10px] text-[color:var(--danger)]">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="gradient-bg-signature rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
