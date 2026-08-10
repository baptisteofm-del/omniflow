import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ConversationView } from '@/components/app/inbox/ConversationView'
import { FanIntelligencePanel } from '@/components/app/inbox/FanIntelligencePanel'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, ai_mode, fan_id, creators(display_name), fans(display_name)')
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, direction, sender_type, text, is_paid, price_amount, message_type, sent_at')
    .eq('conversation_id', id)
    .order('sent_at', { ascending: true })

  const { data: memories } = await supabase
    .from('fan_memories')
    .select('id, category, label, value, confidence, importance, status, source, last_confirmed_at')
    .eq('fan_id', conversation.fan_id)
    .order('importance', { ascending: false })

  const { data: scores } = await supabase
    .from('fan_scores')
    .select(
      'purchase_intent, relationship_score, spending_potential, engagement_score, churn_risk, omni_score, reasons, computed_by, version'
    )
    .eq('fan_id', conversation.fan_id)
    .maybeSingle()

  const creator = conversation.creators as unknown as { display_name: string } | null
  const fan = conversation.fans as unknown as { display_name: string } | null

  return (
    <div className="mx-auto max-w-5xl">
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ConversationView conversationId={id} initialMessages={messages ?? []} />
        <FanIntelligencePanel
          conversationId={id}
          fanId={conversation.fan_id}
          memories={memories ?? []}
          scores={scores ?? null}
        />
      </div>
    </div>
  )
}
