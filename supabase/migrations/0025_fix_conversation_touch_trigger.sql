-- Fixes a real bug: touch_conversation_on_message() unconditionally
-- overwrote conversations.last_message_at/last_inbound_at/last_outbound_at
-- with whatever message just got inserted, regardless of whether that
-- message was actually newer. MYM sync inserts a conversation's messages
-- newest-first (see mym.ts's getMessages()), so after every sync the FINAL
-- trigger firing was for the OLDEST synced message — leaving these columns
-- pointing at old data. This is what made "awaiting reply" wrong (a
-- conversation whose real last message was ours could still show as
-- needing a reply) and skewed the Inbox list's sort order.

create or replace function touch_conversation_on_message()
returns trigger as $$
begin
  update conversations
  set last_message_at = greatest(coalesce(last_message_at, new.sent_at), new.sent_at),
      last_inbound_at = case
        when new.direction = 'inbound' then greatest(coalesce(last_inbound_at, new.sent_at), new.sent_at)
        else last_inbound_at
      end,
      last_outbound_at = case
        when new.direction = 'outbound' then greatest(coalesce(last_outbound_at, new.sent_at), new.sent_at)
        else last_outbound_at
      end,
      updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- One-time backfill: existing conversations already have these columns
-- corrupted by the bug above (not just future inserts) — recompute all
-- three from the real message history.
update conversations c
set
  last_message_at = m.max_sent_at,
  last_inbound_at = m.max_inbound_at,
  last_outbound_at = m.max_outbound_at
from (
  select
    conversation_id,
    max(sent_at) as max_sent_at,
    max(sent_at) filter (where direction = 'inbound') as max_inbound_at,
    max(sent_at) filter (where direction = 'outbound') as max_outbound_at
  from messages
  group by conversation_id
) m
where m.conversation_id = c.id;
