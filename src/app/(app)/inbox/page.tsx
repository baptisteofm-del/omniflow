import Link from 'next/link'
import { MessageSquare, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NewMockConversationForm } from '@/components/app/inbox/NewMockConversationForm'

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag: activeTag } = await searchParams
  const supabase = await createClient()

  const { data: creators } = await supabase.from('creators').select('id, display_name').order('created_at')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, ai_mode, fan_id, last_message_at, creators(display_name), fans(display_name)')
    .order('last_message_at', { ascending: false, nullsFirst: false })

  const { data: allTags } = await supabase.from('tags').select('id, name').order('name')

  const fanIds = (conversations ?? []).map((c) => c.fan_id)
  const { data: fanTagRows } = fanIds.length
    ? await supabase.from('fan_tags').select('fan_id, tags(name)').in('fan_id', fanIds)
    : { data: [] }

  const tagsByFan = new Map<string, string[]>()
  for (const row of fanTagRows ?? []) {
    const name = (row.tags as unknown as { name: string } | null)?.name
    if (!name) continue
    const list = tagsByFan.get(row.fan_id as string) ?? []
    list.push(name)
    tagsByFan.set(row.fan_id as string, list)
  }

  const filteredConversations = activeTag
    ? (conversations ?? []).filter((c) => tagsByFan.get(c.fan_id as string)?.includes(activeTag))
    : conversations ?? []

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Inbox</h1>
      <p className="mb-6 text-sm text-[color:var(--foreground-muted)]">
        Conversations avec vos fans. Environnement Mock — aucune donnée réelle.
      </p>

      {allTags && allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-[color:var(--foreground-muted)]" />
          <Link
            href="/inbox"
            className={`rounded-full border px-2.5 py-1 text-xs ${
              !activeTag
                ? 'border-[color:var(--border-strong)] text-[color:var(--foreground)]'
                : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
            }`}
          >
            Tous
          </Link>
          {allTags.map((t) => (
            <Link
              key={t.id}
              href={`/inbox?tag=${encodeURIComponent(t.name)}`}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                activeTag === t.name
                  ? 'border-[color:var(--border-strong)] text-[color:var(--foreground)]'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}

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
            {filteredConversations.length === 0 ? (
              <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
                  <MessageSquare className="h-6 w-6 text-[color:var(--cyan)]" />
                </div>
                <h2 className="text-base font-semibold">Aucune conversation</h2>
                <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
                  {activeTag
                    ? `Aucune conversation avec la liste "${activeTag}".`
                    : 'Démarrez une conversation de test avec le formulaire à droite.'}
                </p>
              </div>
            ) : (
              <div className="glass divide-y divide-[color:var(--border)] overflow-hidden rounded-2xl">
                {filteredConversations.map((c) => {
                  const creator = c.creators as unknown as { display_name: string } | null
                  const fan = c.fans as unknown as { display_name: string } | null
                  const fanTags = tagsByFan.get(c.fan_id as string) ?? []
                  return (
                    <Link
                      key={c.id}
                      href={`/inbox/${c.id}`}
                      className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-white/5"
                    >
                      <div>
                        <p className="font-medium">{fan?.display_name ?? 'Fan'}</p>
                        <p className="text-xs text-[color:var(--foreground-muted)]">{creator?.display_name}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {fanTags.map((name) => (
                          <span
                            key={name}
                            className="rounded-full border border-[color:var(--border-strong)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)]"
                          >
                            {name}
                          </span>
                        ))}
                        <span className="rounded-full border border-[color:var(--border)] px-2.5 py-1 text-xs text-[color:var(--foreground-muted)]">
                          {c.ai_mode}
                        </span>
                      </div>
                    </Link>
                  )
                })}
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
