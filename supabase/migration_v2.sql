-- ============================================================
-- ECLECTUSCARE v2 — Saisonnalité + Génération auto + Photos
-- ============================================================

-- ══════════════════════════════════════
-- MODIFICATION 1 — SAISONNALITÉ
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS food_seasonality (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid REFERENCES foods(id) ON DELETE CASCADE,
  month   integer NOT NULL CHECK (month BETWEEN 1 AND 12)
);

CREATE INDEX IF NOT EXISTS idx_food_seasonality_month ON food_seasonality(month);
CREATE INDEX IF NOT EXISTS idx_food_seasonality_food ON food_seasonality(food_id);

ALTER TABLE food_seasonality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read on food_seasonality" ON food_seasonality FOR SELECT USING (true);

-- Helper: insert seasonality for a food by name across multiple months
-- We'll use a DO block to map food names to IDs

DO $$
DECLARE
  v_id uuid;
BEGIN
  -- ── FRUITS ──────────────────────────────────────────
  -- Grenade: sept-déc
  SELECT id INTO v_id FROM foods WHERE name = 'Grenade';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Figue: juil-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Figue';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Pomme: août-avril (stockage)
  SELECT id INTO v_id FROM foods WHERE name = 'Pomme';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,4),(v_id,8),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Poire: août-mars
  SELECT id INTO v_id FROM foods WHERE name = 'Poire';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,8),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Kiwi: nov-mai
  SELECT id INTO v_id FROM foods WHERE name = 'Kiwi';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,4),(v_id,5),(v_id,11),(v_id,12);
  END IF;

  -- Melon: juin-sept
  SELECT id INTO v_id FROM foods WHERE name = 'Melon';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,6),(v_id,7),(v_id,8),(v_id,9);
  END IF;

  -- Pastèque: juil-sept
  SELECT id INTO v_id FROM foods WHERE name = 'Pastèque';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,7),(v_id,8),(v_id,9);
  END IF;

  -- Cerise: mai-juil
  SELECT id INTO v_id FROM foods WHERE name = 'Cerise';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,5),(v_id,6),(v_id,7);
  END IF;

  -- Abricot: juin-août
  SELECT id INTO v_id FROM foods WHERE name = 'Abricot';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,6),(v_id,7),(v_id,8);
  END IF;

  -- Pêche: juin-sept
  SELECT id INTO v_id FROM foods WHERE name = 'Pêche';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,6),(v_id,7),(v_id,8),(v_id,9);
  END IF;

  -- Prune: juil-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Prune';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Raisin: août-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Raisin';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Fraise: mai-juil
  SELECT id INTO v_id FROM foods WHERE name = 'Fraise';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,5),(v_id,6),(v_id,7);
  END IF;

  -- Banane: import toute l'année → pas de seasonality (hors saison FR toujours)
  -- Mangue: import toute l'année → pas de seasonality (badge hors saison)
  -- Papaye: import toute l'année → pas de seasonality (badge hors saison)
  -- Goyave: import → pas de seasonality
  -- Tomate mûre: juin-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Tomate mûre';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Agrumes (pulpe): nov-avril
  SELECT id INTO v_id FROM foods WHERE name = 'Agrumes (pulpe)';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,4),(v_id,11),(v_id,12);
  END IF;

  -- ── LÉGUMES ─────────────────────────────────────────
  -- Carotte: toute l'année
  SELECT id INTO v_id FROM foods WHERE name = 'Carotte';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,4),(v_id,5),(v_id,6),
      (v_id,7),(v_id,8),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Patate douce: import toute l'année → pas de seasonality (badge hors saison)

  -- Potiron / Courge: sept-mars
  SELECT id INTO v_id FROM foods WHERE name = 'Potiron / Courge';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Poivron rouge: juin-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Poivron rouge';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Poivron vert: juin-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Poivron vert';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Brocoli: sept-mars
  SELECT id INTO v_id FROM foods WHERE name = 'Brocoli';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Courgette: mai-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Courgette';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,5),(v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Betterave: toute l'année (conservation)
  SELECT id INTO v_id FROM foods WHERE name = 'Betterave';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,4),(v_id,5),(v_id,6),
      (v_id,7),(v_id,8),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Haricots verts cuits: mai-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Haricots verts cuits';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,5),(v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Maïs cuit: juin-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Maïs cuit';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Céleri: oct-mars
  SELECT id INTO v_id FROM foods WHERE name = 'Céleri';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Radis: toute l'année
  SELECT id INTO v_id FROM foods WHERE name = 'Radis';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,4),(v_id,5),(v_id,6),
      (v_id,7),(v_id,8),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Laitue: avril-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Laitue';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,4),(v_id,5),(v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

  -- Épinards: toute l'année
  SELECT id INTO v_id FROM foods WHERE name = 'Épinards';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,4),(v_id,5),(v_id,6),
      (v_id,7),(v_id,8),(v_id,9),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Blette: mai-nov
  SELECT id INTO v_id FROM foods WHERE name = 'Blette';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,5),(v_id,6),(v_id,7),(v_id,8),(v_id,9),(v_id,10),(v_id,11);
  END IF;

  -- Mâche: oct-mars
  SELECT id INTO v_id FROM foods WHERE name = 'Mâche';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,1),(v_id,2),(v_id,3),(v_id,10),(v_id,11),(v_id,12);
  END IF;

  -- Pois mange-tout: mai-juil
  SELECT id INTO v_id FROM foods WHERE name = 'Pois mange-tout';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,5),(v_id,6),(v_id,7);
  END IF;

  -- Piment: juil-oct
  SELECT id INTO v_id FROM foods WHERE name = 'Piment';
  IF v_id IS NOT NULL THEN
    INSERT INTO food_seasonality (food_id, month) VALUES
      (v_id,7),(v_id,8),(v_id,9),(v_id,10);
  END IF;

END $$;


-- ══════════════════════════════════════
-- MODIFICATION 2 — GÉNÉRATION AUTO
-- ══════════════════════════════════════

ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS generation_reason jsonb;
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS generation_nutrition_score integer;

-- ══════════════════════════════════════
-- MODIFICATION 3 — PHOTOS GAMELLES
-- ══════════════════════════════════════

ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS photo_taken_at timestamptz;

-- Storage bucket (doit être créé via le Dashboard Supabase ou l'API admin)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('meal-photos', 'meal-photos', false);

-- Storage RLS policies (à exécuter si le bucket est créé)
-- CREATE POLICY "Users can upload own meal photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Users can view own meal photos"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Users can delete own meal photos"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
