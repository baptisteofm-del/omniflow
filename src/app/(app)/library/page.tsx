import Link from 'next/link'
import { Plus, ImageIcon, FolderPlus, Workflow } from 'lucide-react'
import { MediaCard } from '@/components/app/media/MediaCard'
import { createMediaFolder } from '@/lib/media/actions'
import { checkPageAccess } from '@/lib/permissions/check'
import { AccessRestricted } from '@/components/app/AccessRestricted'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  active: 'Actif',
  paused: 'En pause',
  archived: 'Archivé',
}

type Tab = 'media' | 'scripts'

// Bibliothèque (owner correction: "c'était pas faire des groupes dans la
// sidebar mais des regroupements sur une page seulement") — Médias et
// Scripts are two tabs of ONE page/route now, not two separate top-level
// pages linked from a sidebar dropdown. /media/new, /scripts/new and
// /scripts/[id] stay their own routes (a create form or a single script's
// builder can't sensibly be a tab of a list page) but link back here.
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; folder?: string }>
}) {
  const { tab: tabParam, folder } = await searchParams
  const tab: Tab = tabParam === 'scripts' ? 'scripts' : 'media'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Bibliothèque</h1>
        <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
          Médias vendables et scripts commerciaux, au même endroit.
        </p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-[color:var(--border)]">
        <Link
          href="/library?tab=media"
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'media'
              ? 'border-[color:var(--violet)] text-[color:var(--foreground)]'
              : 'border-transparent text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Médias
        </Link>
        <Link
          href="/library?tab=scripts"
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'scripts'
              ? 'border-[color:var(--violet)] text-[color:var(--foreground)]'
              : 'border-transparent text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
          }`}
        >
          <Workflow className="h-4 w-4" />
          Scripts
        </Link>
      </div>

      {tab === 'media' ? <MediaTab folder={folder} /> : <ScriptsTab />}
    </div>
  )
}

async function MediaTab({ folder }: { folder?: string }) {
  const { supabase, allowed } = await checkPageAccess('media.manage')
  if (!allowed) return <AccessRestricted feature="les Médias" />

  const { data: folders } = await supabase.from('media_folders').select('id, name').order('name', { ascending: true })

  let assetsQuery = supabase
    .from('media_assets')
    .select(
      'id, creator_id, storage_key, media_type, title, description, status, target_price, minimum_price, currency, is_for_sale, standalone_allowed, folder_id, creators(display_name)'
    )
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
  if (folder === 'none') assetsQuery = assetsQuery.is('folder_id', null)
  else if (folder) assetsQuery = assetsQuery.eq('folder_id', folder)
  const { data: assets } = await assetsQuery

  const assetsWithUrls = await Promise.all(
    (assets ?? []).map(async (a) => {
      const { data } = await supabase.storage.from('media').createSignedUrl(a.storage_key, 3600)
      return { ...a, signedUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/library?tab=media"
            className={`rounded-full border px-3 py-1 text-xs ${!folder ? 'border-[color:var(--border-strong)] bg-white/10' : 'border-[color:var(--border)] text-[color:var(--foreground-muted)]'}`}
          >
            Tous
          </Link>
          <Link
            href="/library?tab=media&folder=none"
            className={`rounded-full border px-3 py-1 text-xs ${folder === 'none' ? 'border-[color:var(--border-strong)] bg-white/10' : 'border-[color:var(--border)] text-[color:var(--foreground-muted)]'}`}
          >
            Sans dossier
          </Link>
          {(folders ?? []).map((f) => (
            <Link
              key={f.id}
              href={`/library?tab=media&folder=${f.id}`}
              className={`rounded-full border px-3 py-1 text-xs ${folder === f.id ? 'border-[color:var(--border-strong)] bg-white/10' : 'border-[color:var(--border)] text-[color:var(--foreground-muted)]'}`}
            >
              {f.name}
            </Link>
          ))}
          <form action={createMediaFolder} className="flex items-center gap-1">
            <input
              name="name"
              placeholder="Nouveau dossier"
              className="rounded-full border border-[color:var(--border)] bg-white/5 px-3 py-1 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-full border border-[color:var(--border)] px-2 py-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <FolderPlus className="h-3 w-3" />
            </button>
          </form>
        </div>
        <Link
          href="/media/new"
          className="gradient-bg-signature inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
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
            Déposez un premier fichier — vous pourrez fixer le prix et le dossier ensuite.
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
              folders={folders ?? []}
              asset={{
                id: a.id,
                title: a.title,
                description: a.description,
                media_type: a.media_type,
                status: a.status,
                target_price: a.target_price,
                minimum_price: a.minimum_price,
                currency: a.currency,
                is_for_sale: a.is_for_sale,
                standalone_allowed: a.standalone_allowed,
                folder_id: a.folder_id,
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

async function ScriptsTab() {
  const { supabase, allowed } = await checkPageAccess('scripts.manage')
  if (!allowed) return <AccessRestricted feature="les Scripts" />

  const { data: scripts } = await supabase
    .from('scripts')
    .select('id, name, description, status, creators(display_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6 flex items-center justify-end">
        <Link
          href="/scripts/new"
          className="gradient-bg-signature inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Nouveau script
        </Link>
      </div>

      {!scripts || scripts.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
            <Workflow className="h-6 w-6 text-[color:var(--cyan)]" />
          </div>
          <h2 className="text-base font-semibold">Aucun script pour l&apos;instant</h2>
          <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
            Créez un scénario avec des étapes, des offres payantes et des branches selon l&apos;achat ou non.
          </p>
          <Link
            href="/scripts/new"
            className="gradient-bg-signature mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Créer un script
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scripts.map((s) => {
            const creator = s.creators as unknown as { display_name: string } | null
            return (
              <Link key={s.id} href={`/scripts/${s.id}`} className="glass rounded-2xl p-5 transition-transform hover:scale-[1.01]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
                  <Workflow className="h-5 w-5 text-[color:var(--cyan)]" />
                </div>
                <h3 className="font-medium">{s.name}</h3>
                <p className="mt-1 text-xs text-[color:var(--foreground-muted)]">
                  {STATUS_LABELS[s.status] ?? s.status} · {creator?.display_name ?? 'Toutes les créatrices'}
                </p>
                {s.description && <p className="mt-2 text-xs text-[color:var(--foreground-muted)]">{s.description}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
