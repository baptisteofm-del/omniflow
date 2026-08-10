-- ============================================================================
-- OMNIFLOW V1 — 0003_fix_users_rls_recursion.sql
--
-- Fixes a real bug in 0001_foundation.sql: the "Agency members can view
-- teammates" policy on `users` queried `users` again inside its own USING
-- clause (via a raw correlated subquery), which Postgres RLS re-evaluates
-- recursively on every nested query — causing
-- "infinite recursion detected in policy for relation users" on every
-- SELECT against `users`, including from the user's own session.
--
-- Fix: move the cross-table check into a SECURITY DEFINER helper function
-- (same pattern already used successfully by is_agency_member() and
-- has_permission() in 0001_foundation.sql — those work because a
-- SECURITY DEFINER function's internal queries run as the function's
-- owner, which bypasses RLS, so they never re-trigger the policy that
-- called them).
-- ============================================================================

create or replace function shares_agency_with(target_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from agency_memberships m1
    join agency_memberships m2 on m2.agency_id = m1.agency_id
    join users u on u.id = m1.user_id
    where u.auth_user_id = auth.uid()
      and m1.status = 'active'
      and m2.user_id = target_user_id
      and m2.status = 'active'
  )
$$;

drop policy if exists "Agency members can view teammates" on users;
create policy "Agency members can view teammates" on users
  for select using (shares_agency_with(id));
