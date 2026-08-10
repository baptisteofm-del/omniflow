import { createClient } from '@/lib/supabase/server'
import { NewScriptForm } from '@/components/app/scripts/NewScriptForm'

export default async function NewScriptPage() {
  const supabase = await createClient()
  const { data: creators } = await supabase.from('creators').select('id, display_name').order('created_at')

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">Nouveau script</h1>
      <p className="mb-8 text-sm text-[color:var(--foreground-muted)]">
        Vous ajouterez les étapes (messages, offres, branches) juste après.
      </p>
      <NewScriptForm creators={creators ?? []} />
    </div>
  )
}
