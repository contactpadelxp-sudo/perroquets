export interface FoodCategory {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  species: string;
}

export interface Food {
  id: string;
  name: string;
  category_id: string | null;
  is_forbidden: boolean;
  danger_level: number;
  danger_note: string | null;
  beta_carotene_rich: boolean;
  remove_seed: boolean;
  season: string;
  notes: string | null;
  vitamin_a_ug: number | null;
  vitamin_c_mg: number | null;
  vitamin_e_mg: number | null;
  calcium_mg: number | null;
  phosphorus_mg: number | null;
  iron_mg: number | null;
  protein_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  fat_g: number | null;
  species: string;
  // Joined
  category?: FoodCategory;
}

export interface Food_Seasonality {
  id: string;
  food_id: string;
  month: number;
}

export interface DailyMeal {
  id: string;
  meal_date: string;
  meal_time: 'matin' | 'midi' | 'soir';
  is_recommended: boolean;
  created_at: string;
  meal_items?: MealItem[];
  generation_reason?: GenerationReason | null;
  generation_nutrition_score?: number | null;
  photo_url?: string | null;
  photo_taken_at?: string | null;
}

export interface GenerationReason {
  vitA_deficit_yesterday?: number;
  nutrient_deficits?: Record<string, number>;
  avoided_repeats?: string[];
  seasonal_picks?: string[];
  forced_additions?: string[];
  explanation_lines?: string[];
}

export interface MealItem {
  id: string;
  meal_id: string;
  food_id: string;
  quantity_tbsp: number | null;
  weight_grams: number | null;
  seed_removed: boolean | null;
  actually_eaten: boolean;
  notes: string | null;
  // Joined
  food?: Food;
}

export interface DailyNutritionSummary {
  id: string;
  summary_date: string;
  actual_vitamin_a_ug: number;
  actual_vitamin_c_mg: number;
  actual_vitamin_e_mg: number;
  actual_calcium_mg: number;
  actual_iron_mg: number;
  actual_protein_g: number;
  actual_fiber_g: number;
  target_vitamin_a_ug: number;
  target_vitamin_c_mg: number;
  target_vitamin_e_mg: number;
  target_calcium_mg: number;
  target_iron_mg: number;
  target_protein_g: number;
  target_fiber_g: number;
  fruits_pct: number;
  vegetables_pct: number;
  supplements_pct: number;
  balance_score: number;
  has_beta_carotene: boolean;
  has_sprouts: boolean;
  alerts: Alert[];
  created_at: string;
}

export interface Alert {
  type: 'danger' | 'warning' | 'info';
  message: string;
  icon?: string;
}

export interface WeightLog {
  id: string;
  weigh_date: string;
  weight_grams: number;
  notes: string | null;
  created_at: string;
}

export interface BioCalendarEvent {
  id: string;
  event_type: 'mue' | 'hormones' | 'nidification' | 'reproduction' | 'veterinaire' | 'bien_etre';
  title: string;
  is_recurring: boolean;
  recurrence_month_start: number | null;
  recurrence_month_end: number | null;
  description: string | null;
  dietary_advice: string | null;
  color: string | null;
  icon: string | null;
  species: string;
}

export interface UserSettings {
  id: string;
  user_id?: string;
  species: 'eclectus' | 'african_grey' | 'galah';
  bird_name: string;
  bird_birth_date: string | null;
  weight_min_grams: number;
  weight_max_grams: number;
  meal_time_morning: string;
  meal_time_noon: string;
  meal_time_evening: string;
  quantity_unit: 'tbsp' | 'grams';
  reminders_enabled: boolean;
  hemisphere: 'north' | 'south';
  created_at: string;
  updated_at: string;
}

export type MealTime = 'matin' | 'midi' | 'soir';

export const MEAL_TIME_LABELS: Record<MealTime, string> = {
  matin: 'Matin',
  midi: 'Midi',
  soir: 'Soir',
};

export const NUTRIENT_TARGETS = {
  vitamin_a_ug: { label: 'Vitamine A', unit: 'µg', target: 800, critical: true },
  vitamin_c_mg: { label: 'Vitamine C', unit: 'mg', target: 50, critical: false },
  vitamin_e_mg: { label: 'Vitamine E', unit: 'mg', target: 5, critical: false },
  calcium_mg: { label: 'Calcium', unit: 'mg', target: 150, critical: false },
  iron_mg: { label: 'Fer', unit: 'mg', target: 3, critical: false },
  protein_g: { label: 'Protéines', unit: 'g', target: 12, critical: false },
  fiber_g: { label: 'Fibres', unit: 'g', target: 8, critical: false },
} as const;

export type NutrientKey = keyof typeof NUTRIENT_TARGETS;
