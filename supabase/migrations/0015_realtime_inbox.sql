-- ============================================================================
-- OMNIFLOW V1 — 0015_realtime_inbox.sql
-- Owner feedback: background AI results (Fan Intelligence, Copilot
-- suggestions, Full AI replies) were only picked up by the UI via a fixed
-- setTimeout guess after sending a message — unreliable once a task (Full
-- AI's decision, in particular) ran longer than the guessed delay. Switched
-- `ConversationView` to a Supabase Realtime subscription on `messages`
-- inserts and `conversations` updates instead. This migration is what
-- actually turns Realtime on for those two tables (a table only streams
-- postgres_changes once it's added to the `supabase_realtime` publication).
--
-- Idempotent: ALTER PUBLICATION ... ADD TABLE errors if the table is
-- already a member, so this checks pg_publication_tables first.
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table conversations;
  end if;
end $$;
