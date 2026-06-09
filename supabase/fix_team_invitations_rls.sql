-- ================================
-- FIX TEAM INVITATIONS RLS
-- Corrige les policies qui bloquaient les invités
-- ================================

-- 1. Supprimer les anciennes policies trop restrictives
DROP POLICY IF EXISTS "Only agency owner can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Only agency owner can manage team members" ON team_members;

-- 2. team_invitations : le owner voit tout, l'invité voit sa propre invitation (par email)
CREATE POLICY "Owner can manage all invitations"
  ON team_invitations FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE POLICY "Invited user can read own invitation"
  ON team_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Invited user can update own invitation"
  ON team_invitations FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 3. team_members : le owner gère tout, un membre peut s'insérer lui-même, voir son entrée
CREATE POLICY "Owner can manage all team members"
  ON team_members FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid()));

CREATE POLICY "User can insert themselves as member"
  ON team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- "Members can view their own record" already exists in fix_team_roles.sql

-- 4. Ajouter la colonne accepted_at si elle n'existe pas
ALTER TABLE team_invitations
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
