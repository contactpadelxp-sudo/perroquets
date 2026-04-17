-- ============================================================
-- ECLECTUSCARE — Migration Auth : ajout user_id + RLS par user
-- ============================================================
-- À exécuter APRÈS schema.sql et seed.sql

-- 1. Ajouter user_id aux tables utilisateur
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE daily_nutrition_summary ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Supprimer la contrainte UNIQUE sur summary_date (maintenant par user)
ALTER TABLE daily_nutrition_summary DROP CONSTRAINT IF EXISTS daily_nutrition_summary_summary_date_key;
ALTER TABLE daily_nutrition_summary ADD CONSTRAINT daily_nutrition_summary_user_date_unique UNIQUE (user_id, summary_date);

-- 3. Index sur user_id
CREATE INDEX IF NOT EXISTS idx_daily_meals_user_id ON daily_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_user_id ON meal_items(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_id ON daily_nutrition_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 4. Supprimer les anciennes policies permissives
DROP POLICY IF EXISTS "Allow all on daily_meals" ON daily_meals;
DROP POLICY IF EXISTS "Allow all on meal_items" ON meal_items;
DROP POLICY IF EXISTS "Allow all on daily_nutrition_summary" ON daily_nutrition_summary;
DROP POLICY IF EXISTS "Allow all on weight_logs" ON weight_logs;
DROP POLICY IF EXISTS "Allow all on user_settings" ON user_settings;

-- 5. Nouvelles policies RLS par utilisateur

-- daily_meals : chaque user ne voit que ses repas
CREATE POLICY "Users can view own meals"
  ON daily_meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON daily_meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON daily_meals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON daily_meals FOR DELETE
  USING (auth.uid() = user_id);

-- meal_items : chaque user ne voit que ses items
CREATE POLICY "Users can view own meal_items"
  ON meal_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_items"
  ON meal_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_items"
  ON meal_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal_items"
  ON meal_items FOR DELETE
  USING (auth.uid() = user_id);

-- daily_nutrition_summary
CREATE POLICY "Users can view own nutrition"
  ON daily_nutrition_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition"
  ON daily_nutrition_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition"
  ON daily_nutrition_summary FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- weight_logs
CREATE POLICY "Users can view own weights"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weights"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weights"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weights"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- food_categories et foods restent en lecture publique (données de référence)
-- Les policies "Allow all" restent pour ces tables

-- 6. Supprimer le row par défaut de user_settings (sera créé par user au login)
DELETE FROM user_settings WHERE user_id IS NULL;
