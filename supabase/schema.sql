-- ============================================================
-- ECLECTUSCARE — Schema SQL complet
-- ============================================================

-- CATÉGORIES D'ALIMENTS
create table if not exists food_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  color text,
  icon  text
);

-- ALIMENTS
create table if not exists foods (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  category_id         uuid references food_categories(id),
  is_forbidden        boolean default false,
  danger_level        integer default 0,
  danger_note         text,
  beta_carotene_rich  boolean default false,
  remove_seed         boolean default false,
  season              text default 'all',
  notes               text,
  vitamin_a_ug        numeric,
  vitamin_c_mg        numeric,
  vitamin_e_mg        numeric,
  calcium_mg          numeric,
  phosphorus_mg       numeric,
  iron_mg             numeric,
  protein_g           numeric,
  fiber_g             numeric,
  sugar_g             numeric,
  fat_g               numeric
);

-- REPAS JOURNALIERS
create table if not exists daily_meals (
  id               uuid primary key default gen_random_uuid(),
  meal_date        date not null,
  meal_time        text not null,
  is_recommended   boolean default false,
  created_at       timestamptz default now()
);

-- ITEMS D'UN REPAS
create table if not exists meal_items (
  id              uuid primary key default gen_random_uuid(),
  meal_id         uuid references daily_meals(id) on delete cascade,
  food_id         uuid references foods(id),
  quantity_tbsp   numeric,
  weight_grams    numeric,
  seed_removed    boolean,
  actually_eaten  boolean default true,
  notes           text
);

-- BILAN NUTRITIONNEL JOURNALIER
create table if not exists daily_nutrition_summary (
  id                    uuid primary key default gen_random_uuid(),
  summary_date          date not null unique,
  actual_vitamin_a_ug   numeric default 0,
  actual_vitamin_c_mg   numeric default 0,
  actual_vitamin_e_mg   numeric default 0,
  actual_calcium_mg     numeric default 0,
  actual_iron_mg        numeric default 0,
  actual_protein_g      numeric default 0,
  actual_fiber_g        numeric default 0,
  target_vitamin_a_ug   numeric default 800,
  target_vitamin_c_mg   numeric default 50,
  target_vitamin_e_mg   numeric default 5,
  target_calcium_mg     numeric default 150,
  target_iron_mg        numeric default 3,
  target_protein_g      numeric default 12,
  target_fiber_g        numeric default 8,
  fruits_pct            numeric default 0,
  vegetables_pct        numeric default 0,
  supplements_pct       numeric default 0,
  balance_score         integer default 0,
  has_beta_carotene     boolean default false,
  has_sprouts           boolean default false,
  alerts                jsonb default '[]'::jsonb,
  created_at            timestamptz default now()
);

-- SUIVI DU POIDS
create table if not exists weight_logs (
  id            uuid primary key default gen_random_uuid(),
  weigh_date    date not null,
  weight_grams  numeric not null,
  notes         text,
  created_at    timestamptz default now()
);

-- CALENDRIER BIOLOGIQUE
create table if not exists bio_calendar_events (
  id                       uuid primary key default gen_random_uuid(),
  event_type               text not null,
  title                    text not null,
  is_recurring             boolean default true,
  recurrence_month_start   integer,
  recurrence_month_end     integer,
  description              text,
  dietary_advice           text,
  color                    text,
  icon                     text
);

-- PARAMÈTRES UTILISATEUR
create table if not exists user_settings (
  id                  uuid primary key default gen_random_uuid(),
  bird_name           text default 'Mon Éclectus',
  bird_birth_date     date,
  weight_min_grams    numeric default 380,
  weight_max_grams    numeric default 550,
  meal_time_morning   text default '08:00',
  meal_time_noon      text default '12:00',
  meal_time_evening   text default '18:00',
  quantity_unit       text default 'tbsp',
  reminders_enabled   boolean default true,
  hemisphere          text default 'north',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- INDEX
create index if not exists idx_meal_items_meal_id on meal_items(meal_id);
create index if not exists idx_daily_meals_meal_date on daily_meals(meal_date);
create index if not exists idx_weight_logs_weigh_date on weight_logs(weigh_date);
create index if not exists idx_daily_nutrition_summary_date on daily_nutrition_summary(summary_date);

-- RLS (Row Level Security) - désactivé pour single-user
alter table food_categories enable row level security;
alter table foods enable row level security;
alter table daily_meals enable row level security;
alter table meal_items enable row level security;
alter table daily_nutrition_summary enable row level security;
alter table weight_logs enable row level security;
alter table bio_calendar_events enable row level security;
alter table user_settings enable row level security;

-- Policies : accès public avec anon key (single user app)
create policy "Allow all on food_categories" on food_categories for all using (true) with check (true);
create policy "Allow all on foods" on foods for all using (true) with check (true);
create policy "Allow all on daily_meals" on daily_meals for all using (true) with check (true);
create policy "Allow all on meal_items" on meal_items for all using (true) with check (true);
create policy "Allow all on daily_nutrition_summary" on daily_nutrition_summary for all using (true) with check (true);
create policy "Allow all on weight_logs" on weight_logs for all using (true) with check (true);
create policy "Allow all on bio_calendar_events" on bio_calendar_events for all using (true) with check (true);
create policy "Allow all on user_settings" on user_settings for all using (true) with check (true);
