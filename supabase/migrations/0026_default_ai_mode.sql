-- Owner request: the per-conversation Human/Copilot/Full AI dropdown in the
-- Inbox header forced a manual choice for every single fan, one at a time.
-- Instead: a default mode configured once per creator, applied
-- automatically to every new conversation of hers; the only manual,
-- per-conversation action left is a single takeover/release button.

alter table creator_commercial_settings
  add column if not exists default_ai_mode text not null default 'copilot'
  check (default_ai_mode in ('human_takeover', 'copilot', 'full_ai'));

-- Applies the creator's configured default the moment a conversation is
-- created — never on later updates (a BEFORE INSERT trigger only fires on
-- true inserts), so it can never clobber a human takeover or a mode a
-- chatter already set on an existing conversation.
create or replace function set_conversation_default_ai_mode()
returns trigger as $$
declare
  v_default_mode text;
  v_full_ai_enabled boolean;
begin
  select default_ai_mode, full_ai_enabled into v_default_mode, v_full_ai_enabled
  from creator_commercial_settings
  where creator_id = new.creator_id;

  -- Defense in depth: the Full AI Activation Flow (spec 24.73) requires the
  -- agency to explicitly enable Full AI per creator before any conversation
  -- of hers can run in that mode — a default that predates activation, or
  -- one left stale after a later deactivation, must never bypass that gate.
  if v_default_mode = 'full_ai' and coalesce(v_full_ai_enabled, false) = false then
    v_default_mode := 'copilot';
  end if;

  if v_default_mode is not null then
    new.ai_mode := v_default_mode;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists before_conversation_insert_set_ai_mode on conversations;
create trigger before_conversation_insert_set_ai_mode
  before insert on conversations
  for each row execute procedure set_conversation_default_ai_mode();
