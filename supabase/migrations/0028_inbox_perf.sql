-- Owner report: "chargement très long" on /inbox with real production
-- data (117 conversations). Root cause: the Inbox list page fetched every
-- single message across every conversation just to compute each row's
-- last-message preview, message count, and total spent — thousands of rows
-- pulled and reduced in application code on every navigation, instead of
-- letting Postgres do that aggregation.

-- The existing index only covered (conversation_id, created_at), but every
-- message query in the app orders by sent_at (the actual message
-- timestamp, not the row-insert timestamp) — so that index couldn't be
-- used for the ORDER BY, forcing a full sort every time.
create index if not exists idx_messages_conversation_sent_at on messages(conversation_id, sent_at desc);

-- One aggregation query per Inbox load instead of fetching full history.
create or replace function inbox_conversation_summaries(conv_ids uuid[])
returns table(
  conversation_id uuid,
  last_text text,
  last_sent_at timestamptz,
  message_count bigint,
  purchase_total numeric
)
language sql
stable
as $$
  select
    m.conversation_id,
    (array_agg(m.text order by m.sent_at desc))[1] as last_text,
    max(m.sent_at) as last_sent_at,
    count(*) as message_count,
    coalesce(sum(m.price_amount) filter (where m.message_type = 'purchase_confirmation'), 0) as purchase_total
  from messages m
  where m.conversation_id = any(conv_ids)
  group by m.conversation_id
$$;
