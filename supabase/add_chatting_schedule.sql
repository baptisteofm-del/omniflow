-- ================================
-- CHATTING IA — Planning Horaire
-- ================================

-- Ajout de colonnes pour le planning sur model_personalities
ALTER TABLE model_personalities
  ADD COLUMN IF NOT EXISTS schedule_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{
    "timezone": "Europe/Paris",
    "slots": []
  }';

-- Format du schedule JSON :
-- {
--   "timezone": "Europe/Paris",
--   "slots": [
--     { "day": 0, "from": "09:00", "to": "23:00" },  // 0=dim, 1=lun, ..., 6=sam
--     { "day": 1, "from": "09:00", "to": "23:00" },
--     ...
--   ]
-- }

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS model_personalities_schedule_enabled ON model_personalities(schedule_enabled);
