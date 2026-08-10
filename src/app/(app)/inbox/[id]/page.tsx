import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ConversationView } from '@/components/app/inbox/ConversationView'
import { FanIntelligencePanel } from '@/components/app/inbox/FanIntelligencePanel'
import { FanProfileCard } from '@/components/app/inbox/FanProfileCard'
import { computeFanFlowStage } from '@/lib/fans/fanFlow'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: conversation } = await supabase
    .from('conversations')
    .select(
      'id, ai_mode, fan_id, creators(display_name), fans(id, display_name, birthday, location, income_amount, income_frequency, subscription_status, source)'
    )
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const fanId = conversation.fan_id as string

  const { data: messages } = await supabase
    .from('messages')
    .select('id, direction, sender_type, text, is_paid, price_amount, message_type, sent_at')
    .eq('conversation_id', id)
    .order('sent_at', { ascending: true })

  const { data: memories } = await supabase
    .from('fan_memories')
    .select('id, category, label, value, confidence, importance, status, source, last_confirmed_at')
    .eq('fan_id', fanId)
    .order('importance', { ascending: false })

  const { data: scores } = await supabase
    .from('fan_scores')
    .select(
      'purchase_intent, relationship_score, spending_potential, engagement_score, churn_risk, omni_score, reasons, computed_by, version'
    )
    .eq('fan_id', fanId)
    .maybeSingle()

  const { data: notes } = await supabase
    .from('fan_notes')
    .select('id, text, priority, created_at')
    .eq('fan_id', fanId)
    .order('created_at', { ascending: false })

  const { data: fanTagRows } = await supabase
    .from('fan_tags')
    .select('id, tags(name)')
    .eq('fan_id', fanId)

  const { data: fanConversations } = await supabase.from('conversations').select('id').eq('fan_id', fanId)
  const conversationIds = (fanConversations ?? []).map((c) => c.id)

  const { data: purchaseMessages } = conversationIds.length
    ? await supabase
        .from('messages')
        .select('price_amount')
        .in('conversation_id', conversationIds)
        .eq('message_type', 'purchase_confirmation')
    : { data: [] }

  const totalSpent = (purchaseMessages ?? []).reduce((sum, m) => sum + (m.price_amount ?? 0), 0)
  const purchaseCount = (purchaseMessages ?? []).length

  const creator = conversation.creators as unknown as { display_name: string } | null
  const fan = conversation.fans as unknown as {
    id: string
    display_name: string
    birthday: string | null
    location: string | null
    income_amount: number | null
    income_frequency: string | null
    subscription_status: string
    source: string | null
  } | null

  const flowStage = computeFanFlowStage({
    totalSpent,
    messageCount: messages?.length ?? 0,
    purchaseIntent: scores?.purchase_intent ?? null,
  })

  const tags = (fanTagRows ?? []).map((t) => ({
    id: t.id as string,
    name: (t.tags as unknown as { name: string } | null)?.name ?? '',
  }))

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/inbox" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
        <ArrowLeft className="h-4 w-4" />
        Inbox
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{fan?.display_name ?? 'Fan'}</h1>
          <p className="text-sm text-[color:var(--foreground-muted)]">{creator?.display_name}</p>
        </div>
        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--foreground-muted)]">
          {conversation.ai_mode}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ConversationView conversationId={id} initialMessages={messages ?? []} />
        <div className="space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <FanIntelligencePanel
            conversationId={id}
            fanId={fanId}
            memories={memories ?? []}
            scores={scores ?? null}
          />
          {fan && (
            <FanProfileCard
              conversationId={id}
              fan={fan}
              flowStage={flowStage}
              totalSpent={totalSpent}
              purchaseCount={purchaseCount}
              notes={notes ?? []}
              tags={tags}
            />
          )}
        </div>
      </div>
    </div>
  )
}
