-- ============================================================
-- PARROTCARE — Migration: Add species support
-- ============================================================

-- 1. Add species column to food_categories
ALTER TABLE food_categories ADD COLUMN IF NOT EXISTS species TEXT DEFAULT 'eclectus';

-- 2. Add species column to foods
ALTER TABLE foods ADD COLUMN IF NOT EXISTS species TEXT DEFAULT 'eclectus';

-- 3. Add species column to bio_calendar_events
ALTER TABLE bio_calendar_events ADD COLUMN IF NOT EXISTS species TEXT DEFAULT 'eclectus';

-- 4. Add species column to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS species TEXT DEFAULT 'eclectus';

-- 5. Update existing data to be explicitly eclectus
UPDATE food_categories SET species = 'eclectus' WHERE species IS NULL;
UPDATE foods SET species = 'eclectus' WHERE species IS NULL;
UPDATE bio_calendar_events SET species = 'eclectus' WHERE species IS NULL;
UPDATE user_settings SET species = 'eclectus' WHERE species IS NULL;

-- 6. Add indexes for species filtering
CREATE INDEX IF NOT EXISTS idx_foods_species ON foods(species);
CREATE INDEX IF NOT EXISTS idx_food_categories_species ON food_categories(species);
CREATE INDEX IF NOT EXISTS idx_bio_calendar_events_species ON bio_calendar_events(species);
