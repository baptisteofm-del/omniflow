'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createMediaAsset } from '@/lib/media/actions'
import { sanitizeFilename } from '@/lib/media/filename'

// Uploads straight from the browser to Supabase Storage — Server Actions
// cap request bodies at 1MB and Vercel's function payload limit (~4.5MB)
// makes routing file bytes through a Server Action unworkable for real
// video files. The DB row is only created (via createMediaAsset) once the
// bytes are already safely in the bucket. Deliberately minimal: no price,
// no folder here — those are set afterwards by editing the media (spec:
// "déposer d'abord, configurer ensuite").
export function NewMediaForm({ creators }: { creators: { id: string; display_name: string }[] }) {
  const router = useRouter()
  const [creatorId, setCreatorId] = useState(creators[0]?.id ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Fichier requis')
      return
    }
    if (!creatorId) {
      setError('Sélectionnez une créatrice')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expirée, reconnectez-vous')

      // The bucket's own RLS enforces the agency segment of the path, so a
      // wrong prefix here would simply be rejected by Storage — no need to
      // look up the real agency_id beyond finding it for the path itself.
      const { data: agencyRow } = await supabase
        .from('agency_memberships')
        .select('agency_id')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
      if (!agencyRow) throw new Error('Aucune agence active')

      const storageKey = `${agencyRow.agency_id}/${creatorId}/${Date.now()}-${sanitizeFilename(file.name)}`
      const { error: uploadError } = await supabase.storage.from('media').upload(storageKey, file, {
        contentType: file.type,
        upsert: false,
      })
      if (uploadError) throw new Error(`Échec de l'upload : ${uploadError.message}`)

      await createMediaAsset({
        creator_id: creatorId,
        storage_key: storageKey,
        mime: file.type,
        title: title.trim() || file.name,
      })

      router.push('/media')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-6">
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Créatrice</label>
        <select
          value={creatorId}
          onChange={(e) => setCreatorId(e.target.value)}
          required
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        >
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Fichier (image, vidéo ou audio)</label>
        <input
          type="file"
          required
          accept="image/*,video/*,audio/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Titre (optionnel)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Par défaut : nom du fichier"
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <p className="text-xs text-[color:var(--foreground-muted)]">
        Le prix, le dossier et le statut gratuit/payant se configurent après le dépôt, en éditant le média.
      </p>
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="gradient-bg-signature flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? 'Envoi...' : 'Déposer'}
      </button>
    </form>
  )
}
