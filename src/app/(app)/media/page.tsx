import Link from 'next/link'
import { Plus, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MediaCard } from '@/components/app/media/MediaCard'

export default async function MediaPage() {
  const supabase = await createClient()

  const { data: assets } = await supabase
    .from('media_assets')
    .select('id, creator_id, storage_key, media_type, title, description, status, target_price, minimum_price, currency, standalone_allowed, creators(display_name)')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  const assetsWithUrls = await Promise.all(
    (assets ?? []).map(async (a) => {
      const { data } = await supabase.storage.from('media').createSignedUrl(a.storage_key, 3600)
      return { ...a, signedUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Médias</h1>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
            Contenus vendables : prix cible, prix minimum garanti, utilisables dans les scripts.
          </p>
        </div>
        <Link
          href="/media/new"
          className="gradient-bg-signature inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Ajouter un média
        </Link>
      </div>

      {assetsWithUrls.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
            <ImageIcon className="h-6 w-6 text-[color:var(--cyan)]" />
          </div>
          <h2 className="text-base font-semibold">Aucun média pour l&apos;instant</h2>
          <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
            Ajoutez un premier contenu vendable pour pouvoir l&apos;utiliser dans un script.
          </p>
          <Link
            href="/media/new"
            className="gradient-bg-signature mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter un média
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assetsWithUrls.map((a) => (
            <MediaCard
              key={a.id}
              asset={{
                id: a.id,
                title: a.title,
                description: a.description,
                media_type: a.media_type,
                status: a.status,
                target_price: a.target_price,
                minimum_price: a.minimum_price,
                currency: a.currency,
                standalone_allowed: a.standalone_allowed,
                signedUrl: a.signedUrl,
                creatorName: (a.creators as unknown as { display_name: string } | null)?.display_name ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
