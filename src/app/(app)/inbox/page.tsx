import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NewMockConversationForm } from '@/components/app/inbox/NewMockConversationForm'

export default async function InboxPage() {
  const supabase = await createClient()

  const { data: creators } = await supabase.from('creators').select('id, display_name').order('created_at')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, ai_mode, last_message_at, creators(display_name), fans(display_name)')
    .order('last_message_at', { ascending: false, nullsFirst: false })

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Inbox</h1>
      <p className="mb-8 text-sm text-[color:var(--foreground-muted)]">
        Conversations avec vos fans. Environnement Mock — aucune donnée réelle.
      </p>

      {!creators || creators.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-sm text-[color:var(--foreground-muted)]">
          Ajoutez d&apos;abord{' '}
          <Link href="/creators/new" className="text-[color:var(--cyan)] hover:underline">
            une créatrice
          </Link>{' '}
          avant de démarrer une conversation.
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {!conversations || conversations.length === 0 ? (
              <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
                  <MessageSquare className="h-6 w-6 text-[color:var(--cyan)]" />
                </div>
                <h2 className="text-base font-semibold">Aucune conversation</h2>
                <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
                  Démarrez une conversation de test avec le formulaire à droite.
                </p>
              </div>
            ) : (
              <div className="glass divide-y divide-[color:var(--border)] overflow-hidden rounded-2xl">
                {conversations.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/inbox/${c.id}`}
                    className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-white/5"
                  >
                    <div>
                      <p className="font-medium">{c.fans?.display_name ?? 'Fan'}</p>
                      <p className="text-xs text-[color:var(--foreground-muted)]">{c.creators?.display_name}</p>
                    </div>
                    <span className="rounded-full border border-[color:var(--border)] px-2.5 py-1 text-xs text-[color:var(--foreground-muted)]">
                      {c.ai_mode}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="glass h-fit rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-semibold">Nouvelle conversation de test</h2>
            <NewMockConversationForm creators={creators} />
          </div>
        </div>
      )}
    </div>
  )
}
