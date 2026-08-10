import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ScriptBuilder } from '@/components/app/scripts/ScriptBuilder'

export default async function ScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: script } = await supabase
    .from('scripts')
    .select('id, name, description, status, creators(display_name)')
    .eq('id', id)
    .single()
  if (!script) notFound()

  const { data: versions } = await supabase
    .from('script_versions')
    .select('id, version_number, status, published_at')
    .eq('script_id', id)
    .order('version_number', { ascending: false })

  const draftVersion = versions?.find((v) => v.status === 'draft') ?? null
  const publishedVersion = versions?.find((v) => v.status === 'published') ?? null
  const displayVersion = draftVersion ?? publishedVersion ?? null

  let nodes: {
    id: string
    node_type: string
    title: string | null
    message_template: string | null
    price_amount: number | null
    currency: string | null
    generation_mode: string
    delay_seconds: number
    sequence_order: number
  }[] = []
  let branches: { from_node_id: string; to_node_id: string; condition_type: string }[] = []

  if (displayVersion) {
    const { data: nodeRows } = await supabase
      .from('script_nodes')
      .select('id, node_type, title, message_template, price_amount, currency, generation_mode, delay_seconds, sequence_order')
      .eq('script_version_id', displayVersion.id)
      .order('sequence_order', { ascending: true })
    nodes = nodeRows ?? []

    const { data: edgeRows } = await supabase
      .from('script_edges')
      .select('from_node_id, to_node_id, condition_type')
      .eq('script_version_id', displayVersion.id)
      .in('condition_type', ['purchased', 'not_purchased'])
    branches = edgeRows ?? []
  }

  const creator = script.creators as unknown as { display_name: string } | null

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/scripts" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
        <ArrowLeft className="h-4 w-4" />
        Scripts
      </Link>

      <div className="mb-6">
        <h1 className="text-lg font-semibold">{script.name}</h1>
        <p className="text-sm text-[color:var(--foreground-muted)]">
          {creator?.display_name ?? 'Toutes les créatrices'}
          {script.description ? ` · ${script.description}` : ''}
        </p>
      </div>

      <ScriptBuilder
        scriptId={id}
        isDraftEditable={!!draftVersion}
        versionLabel={
          draftVersion
            ? `Brouillon v${draftVersion.version_number}`
            : publishedVersion
              ? `Publié v${publishedVersion.version_number}`
              : 'Aucune version'
        }
        scriptStatus={script.status}
        nodes={nodes}
        branches={branches}
      />
    </div>
  )
}
