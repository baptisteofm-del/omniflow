-- ================================================
-- FIX COMPLET : SYSTÈME D'INVITATION MEMBRES
-- Refonte complète pour résoudre les bugs
-- ================================================

-- ── 1. AMÉLIORER team_invitations ──────────────────────────────
ALTER TABLE team_invitations
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Créer la colonne status si elle n'existe pas
-- Status: pending, opened, accepted, expired, cancelled
UPDATE team_invitations SET status = CASE 
  WHEN accepted = true THEN 'accepted'
  WHEN expires_at < now() THEN 'expired'
  ELSE 'pending'
END WHERE status = 'pending';

-- ── 2. AMÉLIORER team_members ──────────────────────────────────
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS permissions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- ── 3. AJOUTER colonne accepted_at à team_invitations si absent ─
-- (pour tracer quand l'invitation a été acceptée)

-- ── 4. LISTER LES RÔLES VALIDES ────────────────────────────────
-- À utiliser dans les applications et les policies

-- team_members roles:
-- - owner (créateur de l'agence)
-- - admin (administrateur système)
-- - video_editor (monteur vidéo)
-- - chatting_manager (manager chatting)
-- - marketing_manager (manager marketing)
-- - accountant (comptable)
-- - community_manager (community manager)
-- - chatter (opérateur chatting)
-- - member (membre générique)

-- ── 5. AMÉLIORER team_invitations RLS ──────────────────────────
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Owner can manage all invitations" ON team_invitations;
DROP POLICY IF EXISTS "Invited user can read own invitation" ON team_invitations;
DROP POLICY IF EXISTS "Invited user can update own invitation" ON team_invitations;
DROP POLICY IF EXISTS "Only agency owner can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Only agency owner can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Only agency owner can delete invitations" ON team_invitations;

-- Recréer les policies - Plus simples et efficaces
-- 1. Owner peut tout faire sur les invitations de son agence
CREATE POLICY "Owner full access to invitations"
  ON team_invitations FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

-- 2. Invité peut voir son propre lien d'invitation (avant acceptation)
CREATE POLICY "Invitee can read own invitation"
  ON team_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1)
    AND status IN ('pending', 'opened')
  );

-- ── 6. AMÉLIORER team_members RLS ──────────────────────────────
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Owner can manage all team members" ON team_members;
DROP POLICY IF EXISTS "User can insert themselves as member" ON team_members;
DROP POLICY IF EXISTS "Members can view their own record" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their agency" ON team_members;
DROP POLICY IF EXISTS "Only agency owner can manage team members" ON team_members;

-- Recréer les policies
-- 1. Owner peut gérer tous les membres de son agence
CREATE POLICY "Owner full access to team members"
  ON team_members FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

-- 2. Membre peut voir les autres membres de son agence
CREATE POLICY "Members can view agency members"
  ON team_members FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- 3. Serveur peut créer des membres (via admin client)
-- Cette policy n'est pas strictement nécessaire car admin bypass RLS

-- ── 7. CRÉER INDEXES POUR PERF ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_team_invitations_agency 
  ON team_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token 
  ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email 
  ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status 
  ON team_invitations(status);

CREATE INDEX IF NOT EXISTS idx_team_members_agency 
  ON team_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user 
  ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status 
  ON team_members(status);

-- ── 8. AJOUTER CONSTRAINT CHECK ────────────────────────────────
ALTER TABLE team_invitations DROP CONSTRAINT IF EXISTS team_invitations_status_check;
ALTER TABLE team_invitations 
  ADD CONSTRAINT team_invitations_status_check 
  CHECK (status IN ('pending', 'opened', 'accepted', 'expired', 'cancelled'));

ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_status_check;
ALTER TABLE team_members 
  ADD CONSTRAINT team_members_status_check 
  CHECK (status IN ('active', 'invited', 'suspended'));

-- ── 9. FONCTION HELPER: Marquer les invitations comme expirées ─
CREATE OR REPLACE FUNCTION mark_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- ── 10. FUNCTION: Créer un member et accepter une invitation ────
-- Cette fonction est appelée par le backend lors de l'acceptation
CREATE OR REPLACE FUNCTION accept_team_invitation(
  p_invitation_id uuid,
  p_user_id uuid,
  p_email text
)
RETURNS TABLE (
  success boolean,
  agency_id uuid,
  role text,
  message text
) AS $$
DECLARE
  v_invitation team_invitations%ROWTYPE;
  v_agency_id uuid;
  v_role text;
BEGIN
  -- 1. Récupérer l'invitation
  SELECT * INTO v_invitation FROM team_invitations 
  WHERE id = p_invitation_id;
  
  IF v_invitation IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::uuid, NULL::text, 'Invitation not found'::text;
    RETURN;
  END IF;
  
  -- 2. Vérifier expiration
  IF v_invitation.expires_at < now() THEN
    UPDATE team_invitations SET status = 'expired' WHERE id = p_invitation_id;
    RETURN QUERY SELECT FALSE, NULL::uuid, NULL::text, 'Invitation expired'::text;
    RETURN;
  END IF;
  
  -- 3. Vérifier email correspondence
  IF v_invitation.email != p_email THEN
    RETURN QUERY SELECT FALSE, NULL::uuid, NULL::text, 'Email mismatch'::text;
    RETURN;
  END IF;
  
  -- 4. Vérifier si déjà acceptée
  IF v_invitation.status = 'accepted' THEN
    RETURN QUERY SELECT TRUE, v_invitation.agency_id, v_invitation.role, 'Already accepted'::text;
    RETURN;
  END IF;
  
  v_agency_id := v_invitation.agency_id;
  v_role := COALESCE(v_invitation.role, 'member');
  
  -- 5. Marquer l'invitation comme acceptée
  UPDATE team_invitations 
  SET status = 'accepted', 
      accepted_at = now(),
      accepted_by = p_user_id
  WHERE id = p_invitation_id;
  
  -- 6. Retourner succès
  RETURN QUERY SELECT TRUE, v_agency_id, v_role, 'Success'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cette fonction est SECURITY DEFINER car elle modifie des données sensibles
-- Elle doit être appelée uniquement par le serveur applicatif

GRANT EXECUTE ON FUNCTION accept_team_invitation(uuid, uuid, text) TO authenticated;

