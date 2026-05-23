-- ================================
-- FIX TEAM SCHEMA
-- Étend les rôles + ajoute permissions et status
-- ================================

-- 1. Supprimer les CHECK constraints sur role dans team_members
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_role_check;

-- 2. Ajouter les nouvelles colonnes à team_members si elles n'existent pas
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 3. Supprimer le CHECK sur role dans team_invitations
ALTER TABLE team_invitations DROP CONSTRAINT IF EXISTS team_invitations_role_check;

-- 4. Ajouter permissions à team_invitations
ALTER TABLE team_invitations
  ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT '{}';

-- 5. Recréer les CHECK constraints avec tous les rôles valides
ALTER TABLE team_members
  ADD CONSTRAINT team_members_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'video_editor', 'chatting_manager', 'marketing_manager'));

ALTER TABLE team_invitations
  ADD CONSTRAINT team_invitations_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'video_editor', 'chatting_manager', 'marketing_manager'));

-- 6. CHECK sur status dans team_members
ALTER TABLE team_members
  ADD CONSTRAINT team_members_status_check
  CHECK (status IN ('active', 'invited', 'suspended'));

-- 7. RLS : autoriser les membres à voir leur propre entrée (pour après acceptation)
DROP POLICY IF EXISTS "Members can view their own record" ON team_members;
CREATE POLICY "Members can view their own record"
  ON team_members FOR SELECT
  USING (user_id = auth.uid());

-- 8. RLS invitation : permettre la mise à jour lors de l'acceptation
DROP POLICY IF EXISTS "Users can accept their own invitation" ON team_invitations;
CREATE POLICY "Users can accept their own invitation"
  ON team_invitations FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
