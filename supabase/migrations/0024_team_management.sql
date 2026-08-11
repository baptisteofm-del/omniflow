-- ============================================================================
-- OMNIFLOW V1 — 0024_team_management.sql
-- Owner request: add agency team members (Manager/Chatter and other roles
-- already exist as system roles since Phase 1 — 0001_foundation.sql — this
-- just builds the invite flow and UI on top of that already-designed
-- roles/permissions/agency_memberships schema, and extends the permission
-- catalog to cover real feature areas so "select which features they can
-- use" is meaningful).
-- ============================================================================

-- ============================================================================
-- AGENCY_INVITATIONS — pending invites, resolved by email match on signup
-- (spec 28.7-28.9's roles/permissions model didn't yet have an invite path —
-- handle_new_user() always created a brand-new agency for every signup).
-- ============================================================================
create table if not exists agency_invitations (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references agencies(id) on delete cascade not null,
  email text not null,
  role_id uuid references roles(id) on delete restrict not null,
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  accepted_at timestamptz
);

create index if not exists idx_agency_invitations_agency on agency_invitations(agency_id);
create index if not exists idx_agency_invitations_email on agency_invitations(lower(email));

alter table agency_invitations enable row level security;

drop policy if exists "Team inviters can view invitations" on agency_invitations;
create policy "Team inviters can view invitations" on agency_invitations
  for select using (has_permission(agency_id, 'team.view'));

drop policy if exists "Team inviters can manage invitations" on agency_invitations;
create policy "Team inviters can manage invitations" on agency_invitations
  for all using (has_permission(agency_id, 'team.invite'))
  with check (has_permission(agency_id, 'team.invite'));

-- ============================================================================
-- Extend the permission catalog to real feature areas (Phase 1 only had
-- agency/creator/team/billing) so a role's checkbox list actually maps to
-- something in the product, not just administrative settings.
-- ============================================================================
insert into permissions (key, description) values
  ('inbox.view', 'Voir les conversations et messages'),
  ('inbox.send', 'Répondre aux fans, utiliser les suggestions Copilot'),
  ('scripts.manage', 'Créer et modifier les scripts'),
  ('media.manage', 'Gérer la bibliothèque média'),
  ('analytics.view', 'Voir les tableaux de bord analytics'),
  ('ai_settings.manage', 'Gérer l’activation Full AI et les kill switches')
on conflict (key) do nothing;

-- Re-run the same "Owner: all" / "Admin: all except billing/agency" rule so
-- the two newly-added permission keys above are included exactly like every
-- key added since Phase 1 would be.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Owner' and r.is_system = true
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Admin' and r.is_system = true
  and p.key not in ('agency.manage', 'billing.manage')
on conflict do nothing;

-- Manager: adds the day-to-day feature areas an agency manager runs.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Manager' and r.is_system = true
  and p.key in ('inbox.view', 'inbox.send', 'scripts.manage', 'media.manage', 'analytics.view')
on conflict do nothing;

-- Chatter: inbox only — exactly the role's name.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Chatter' and r.is_system = true
  and p.key in ('inbox.view', 'inbox.send')
on conflict do nothing;

-- Viewer: read-only additions.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'Viewer' and r.is_system = true
  and p.key in ('inbox.view', 'analytics.view')
on conflict do nothing;

-- ============================================================================
-- handle_new_user(): join an inviting agency instead of creating a new one
-- when a pending invitation matches the signing-up email (case-insensitive —
-- Supabase Auth itself already verifies the email is real via confirmation,
-- so an email match is a reliable link, no token round-trip through signup
-- metadata needed).
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
declare
  new_agency_id uuid;
  new_user_id uuid;
  owner_role_id uuid;
  pending_invite record;
begin
  insert into users (auth_user_id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  returning id into new_user_id;

  select * into pending_invite
  from agency_invitations
  where lower(email) = lower(new.email) and status = 'pending'
  order by created_at desc
  limit 1;

  if pending_invite.id is not null then
    insert into agency_memberships (agency_id, user_id, role_id, status, invited_by, joined_at)
    values (pending_invite.agency_id, new_user_id, pending_invite.role_id, 'active', pending_invite.invited_by, now());

    update agency_invitations set status = 'accepted', accepted_at = now() where id = pending_invite.id;
  else
    insert into agencies (name, plan_id)
    values (
      coalesce(new.raw_user_meta_data->>'agency_name', 'My Agency'),
      coalesce(new.raw_user_meta_data->>'plan_id', 'copilot')
    )
    returning id into new_agency_id;

    select id into owner_role_id from roles where name = 'Owner' and is_system = true;

    insert into agency_memberships (agency_id, user_id, role_id, status, joined_at)
    values (new_agency_id, new_user_id, owner_role_id, 'active', now());
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
