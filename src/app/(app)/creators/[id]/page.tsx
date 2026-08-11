import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plug } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CreatorAvatarUpload } from '@/components/app/creators/CreatorAvatarUpload'
import { CreatorIdentityForm } from '@/components/app/creators/CreatorIdentityForm'
import { MymConnectionCard } from '@/components/app/settings/MymConnectionCard'
import { checkPageAccess } from '@/lib/permissions/check'
import { AccessRestricted } from '@/components/app/AccessRestricted'

// See settings/integrations/page.tsx — same reason (syncMymCreator can run
// long for a large account).
export const maxDuration = 300

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { allowed } = await checkPageAccess('creator.view')
  if (!allowed) return <AccessRestricted feature="cette créatrice" />

  const supabase = await createClient()

  const { data: creator } = await supabase
    .from('creators')
    .select('id, display_name, internal_name, default_language, timezone, avatar_url, notes, status')
    .eq('id', id)
    .single()

  if (!creator) notFound()

  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()

  const { data: connection } = mymPlatform
    ? await supabase
        .from('platform_connections')
        .select('status, last_synced_at, platform_credentials(last_error)')
        .eq('creator_id', id)
        .eq('platform_id', mymPlatform.id)
        .maybeSingle()
    : { data: null }

  const credRow = connection?.platform_credentials as unknown as { last_error: string | null }[] | { last_error: string | null } | null
  const lastError = (Array.isArray(credRow) ? credRow[0] : credRow)?.last_error ?? null

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/creators" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
        <ArrowLeft className="h-4 w-4" />
        Créatrices
      </Link>

      <div className="glass mb-6 flex items-start gap-5 rounded-2xl p-6">
        <CreatorAvatarUpload creatorId={creator.id} avatarUrl={creator.avatar_url} />
        <div className="flex-1">
          <CreatorIdentityForm
            creator={{
              id: creator.id,
              display_name: creator.display_name,
              internal_name: creator.internal_name,
              default_language: creator.default_language,
              timezone: creator.timezone,
              notes: creator.notes,
            }}
          />
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Plug className="h-4 w-4" />
        <h2 className="text-sm font-semibold">Intégrations</h2>
      </div>

      {!mymPlatform ? (
        <p className="text-sm text-[color:var(--foreground-muted)]">
          Migration <code>0019_mym_real_connector.sql</code> pas encore appliquée.
        </p>
      ) : (
        <MymConnectionCard
          creatorId={creator.id}
          creatorName={creator.display_name}
          status={(connection?.status as 'connected' | 'disconnected' | 'error' | undefined) ?? 'none'}
          lastError={lastError}
          lastSyncedAt={connection?.last_synced_at ?? null}
        />
      )}
    </div>
  )
}
