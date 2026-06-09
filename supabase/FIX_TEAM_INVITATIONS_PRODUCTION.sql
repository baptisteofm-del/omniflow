-- ================================================
-- FIX COMPLET : TEAM INVITATIONS + MEMBERS
-- À exécuter dans Supabase SQL Editor (production)
-- ================================================

-- ── 1. CRÉER team_invitations si absente ──────────────────────
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'member',
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '7 days',
  accepted_at timestamptz,
  permissions text[] DEFAULT '{}'
);

-- ── 2. AJOUTER colonnes manquantes à team_members ─────────────
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ── 3. SUPPRIMER les vieux CHECK constraints ──────────────────
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_role_check;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_status_check;
ALTER TABLE team_invitations DROP CONSTRAINT IF EXISTS team_invitations_role_check;

-- ── 4. RECRÉER les CHECK avec tous les rôles valides ──────────
ALTER TABLE team_members
  ADD CONSTRAINT team_members_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'video_editor', 'chatting_manager', 'marketing_manager'));

ALTER TABLE team_members
  ADD CONSTRAINT team_members_status_check
  CHECK (status IN ('active', 'invited', 'suspended'));

ALTER TABLE team_invitations
  ADD CONSTRAINT team_invitations_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'video_editor', 'chatting_manager', 'marketing_manager'));

-- ── 5. ACTIVER RLS ────────────────────────────────────────────
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- ── 6. SUPPRIMER les anciennes policies ───────────────────────
DROP POLICY IF EXISTS "Only agency owner can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Only agency owner can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Only agency owner can delete invitations" ON team_invitations;
DROP POLICY IF EXISTS "Owner can manage all invitations" ON team_invitations;
DROP POLICY IF EXISTS "Invited user can read own invitation" ON team_invitations;
DROP POLICY IF EXISTS "Invited user can update own invitation" ON team_invitations;
DROP POLICY IF EXISTS "Users can accept their own invitation" ON team_invitations;

DROP POLICY IF EXISTS "Users can view team members of their agency" ON team_members;
DROP POLICY IF EXISTS "Only agency owner can manage team members" ON team_members;
DROP POLICY IF EXISTS "Owner can manage all team members" ON team_members;
DROP POLICY IF EXISTS "User can insert themselves as member" ON team_members;
DROP POLICY IF EXISTS "Members can view their own record" ON team_members;
DROP POLICY IF EXISTS "Team by agency" ON team_members;

-- ── 7. RECRÉER les policies proprement ───────────────────────

-- team_invitations
CREATE POLICY "Owner can manage all invitations"
  ON team_invitations FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE POLICY "Invited user can read own invitation"
  ON team_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Invited user can update own invitation"
  ON team_invitations FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- team_members
CREATE POLICY "Owner can manage all team members"
  ON team_members FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE POLICY "User can insert themselves as member"
  ON team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can view their own record"
  ON team_members FOR SELECT
  USING (user_id = auth.uid());

-- ── 8. INDEX pour perf ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_team_invitations_agency ON team_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_members_agency ON team_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
