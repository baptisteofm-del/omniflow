'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Camera, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateCreatorAvatar } from '@/lib/creators/actions'
import { sanitizeFilename } from '@/lib/media/filename'

export function CreatorAvatarUpload({ creatorId, avatarUrl }: { creatorId: string; avatarUrl: string | null }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl)

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expirée, reconnectez-vous')

      const { data: agencyRow } = await supabase
        .from('agency_memberships')
        .select('agency_id')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
      if (!agencyRow) throw new Error('Aucune agence active')

      const storageKey = `${agencyRow.agency_id}/${creatorId}-${Date.now()}-${sanitizeFilename(file.name)}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(storageKey, file, {
        contentType: file.type,
        upsert: true,
      })
      if (uploadError) throw new Error(`Échec de l'upload : ${uploadError.message}`)

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(storageKey)
      await updateCreatorAvatar(creatorId, publicUrlData.publicUrl)

      setPreview(publicUrlData.publicUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] disabled:opacity-70"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-10 w-10 text-[color:var(--cyan)]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <span className="text-[10px] text-[color:var(--foreground-muted)]">Changer la photo</span>
      {error && <p className="max-w-[10rem] text-center text-[10px] text-[color:var(--danger)]">{error}</p>}
    </div>
  )
}
