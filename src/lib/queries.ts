import { supabase } from './supabase';
import type {
  Food,
  FoodCategory,
  DailyMeal,
  MealItem,
  DailyNutritionSummary,
  WeightLog,
  BioCalendarEvent,
  UserSettings,
  MealTime,
} from '@/types/database';

// ── Food Categories ──
export async function getFoodCategories(species?: string): Promise<FoodCategory[]> {
  let query = supabase
    .from('food_categories')
    .select('*')
    .order('name');
  if (species) query = query.eq('species', species);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ── Foods ──
export async function getFoods(species?: string): Promise<Food[]> {
  let query = supabase
    .from('foods')
    .select('*, category:food_categories(*)')
    .order('name');
  if (species) query = query.eq('species', species);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getFoodsByCategory(categoryId: string): Promise<Food[]> {
  const { data, error } = await supabase
    .from('foods')
    .select('*, category:food_categories(*)')
    .eq('category_id', categoryId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getSafeFoods(species?: string): Promise<Food[]> {
  let query = supabase
    .from('foods')
    .select('*, category:food_categories(*)')
    .eq('is_forbidden', false)
    .order('name');
  if (species) query = query.eq('species', species);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ── Daily Meals ──
export async function getMealsForDate(date: string): Promise<DailyMeal[]> {
  const { data, error } = await supabase
    .from('daily_meals')
    .select(`
      *,
      meal_items (
        *,
        food:foods (*, category:food_categories(*))
      )
    `)
    .eq('meal_date', date)
    .order('meal_time');
  if (error) throw error;
  return data ?? [];
}

export async function getOrCreateMeal(date: string, mealTime: MealTime): Promise<DailyMeal> {
  const { data: existing } = await supabase
    .from('daily_meals')
    .select('*')
    .eq('meal_date', date)
    .eq('meal_time', mealTime)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('daily_meals')
    .insert({ meal_date: date, meal_time: mealTime })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addMealItem(item: {
  meal_id: string;
  food_id: string;
  quantity_tbsp?: number;
  weight_grams?: number;
  seed_removed?: boolean;
  notes?: string;
}): Promise<MealItem> {
  const { data, error } = await supabase
    .from('meal_items')
    .insert(item)
    .select('*, food:foods(*, category:food_categories(*))')
    .single();
  if (error) throw error;
  return data;
}

export async function updateMealItem(id: string, updates: Partial<MealItem>): Promise<MealItem> {
  const { data, error } = await supabase
    .from('meal_items')
    .update(updates)
    .eq('id', id)
    .select('*, food:foods(*, category:food_categories(*))')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMealItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('meal_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Nutrition Summary ──
export async function getNutritionSummary(date: string): Promise<DailyNutritionSummary | null> {
  const { data, error } = await supabase
    .from('daily_nutrition_summary')
    .select('*')
    .eq('summary_date', date)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getNutritionHistory(days: number = 30): Promise<DailyNutritionSummary[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const { data, error } = await supabase
    .from('daily_nutrition_summary')
    .select('*')
    .gte('summary_date', startDate.toISOString().split('T')[0])
    .order('summary_date');
  if (error) throw error;
  return data ?? [];
}

export async function upsertNutritionSummary(
  summary: Omit<DailyNutritionSummary, 'id' | 'created_at'>
): Promise<DailyNutritionSummary> {
  const { data, error } = await supabase
    .from('daily_nutrition_summary')
    .upsert(summary, { onConflict: 'summary_date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Weight Logs ──
export async function getWeightLogs(limit?: number): Promise<WeightLog[]> {
  let query = supabase
    .from('weight_logs')
    .select('*')
    .order('weigh_date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getWeightLogsPeriod(startDate: string, endDate: string): Promise<WeightLog[]> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .gte('weigh_date', startDate)
    .lte('weigh_date', endDate)
    .order('weigh_date');
  if (error) throw error;
  return data ?? [];
}

export async function addWeightLog(log: { weigh_date: string; weight_grams: number; notes?: string }): Promise<WeightLog> {
  const { data, error } = await supabase
    .from('weight_logs')
    .insert(log)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWeightLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Bio Calendar ──
export async function getBioCalendarEvents(species?: string): Promise<BioCalendarEvent[]> {
  let query = supabase
    .from('bio_calendar_events')
    .select('*')
    .order('recurrence_month_start');
  if (species) query = query.eq('species', species);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function getActiveEventsForMonth(events: BioCalendarEvent[], month: number): BioCalendarEvent[] {
  return events.filter((event) => {
    const start = event.recurrence_month_start;
    const end = event.recurrence_month_end;
    if (start === null || end === null) return false;
    if (start <= end) {
      return month >= start && month <= end;
    }
    // Wrap around (e.g., July=7 to January=1)
    return month >= start || month <= end;
  });
}

// ── User Settings ──
export async function getUserSettings(): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserSettings(id: string, updates: Partial<UserSettings>): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Meal history for generator ──
export async function getRecentMealFoodIds(days: number = 2): Promise<string[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const { data, error } = await supabase
    .from('daily_meals')
    .select('meal_items(food_id)')
    .gte('meal_date', startDate.toISOString().split('T')[0]);
  if (error) throw error;
  const foodIds: string[] = [];
  data?.forEach((meal: { meal_items: { food_id: string }[] }) => {
    meal.meal_items?.forEach((item) => {
      if (item.food_id && !foodIds.includes(item.food_id)) {
        foodIds.push(item.food_id);
      }
    });
  });
  return foodIds;
}

export async function getWeekFoodCounts(categoryName: string): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const { data, error } = await supabase
    .from('daily_meals')
    .select(`
      meal_items (
        food:foods (
          category:food_categories (name)
        )
      )
    `)
    .gte('meal_date', startDate.toISOString().split('T')[0]);
  if (error) throw error;
  let count = 0;
  data?.forEach((meal: any) => {
    meal.meal_items?.forEach((item: any) => {
      if (item.food?.category?.name === categoryName) count++;
    });
  });
  return count;
}
