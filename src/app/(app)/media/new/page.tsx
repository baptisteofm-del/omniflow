import { createClient } from '@/lib/supabase/server'
import { NewMediaForm } from '@/components/app/media/NewMediaForm'

export default async function NewMediaPage() {
  const supabase = await createClient()
  const { data: creators } = await supabase.from('creators').select('id, display_name').order('created_at')

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">Ajouter un média</h1>
      <p className="mb-8 text-sm text-[color:var(--foreground-muted)]">
        Le prix minimum est une contrainte dure : jamais contourné, ni par un script, ni par l&apos;IA.
      </p>
      <NewMediaForm creators={creators ?? []} />
    </div>
  )
}
