'use server';

import { createSupabaseServer } from './supabase-server';
import type { Alert, GenerationReason } from '@/types/database';
import { getSpeciesConfig, type SpeciesId } from './species';

async function getSupabaseAndUser() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  return { supabase, userId: user.id };
}

async function getUserSpecies(supabase: any, userId: string): Promise<SpeciesId> {
  const { data } = await supabase
    .from('user_settings')
    .select('species')
    .eq('user_id', userId)
    .limit(1)
    .single();
  return (data?.species as SpeciesId) || 'eclectus';
}

function getTargets(species: SpeciesId): Record<string, { target: number; label: string; key: string }> {
  const config = getSpeciesConfig(species);
  return {
    vitamin_a_ug: { target: config.targets.vitamin_a_ug, label: 'Vitamine A', key: 'vitamin_a_ug' },
    vitamin_c_mg: { target: config.targets.vitamin_c_mg, label: 'Vitamine C', key: 'vitamin_c_mg' },
    vitamin_e_mg: { target: config.targets.vitamin_e_mg, label: 'Vitamine E', key: 'vitamin_e_mg' },
    calcium_mg: { target: config.targets.calcium_mg, label: 'Calcium', key: 'calcium_mg' },
    iron_mg: { target: config.targets.iron_mg, label: 'Fer', key: 'iron_mg' },
    protein_g: { target: config.targets.protein_g, label: 'Protéines', key: 'protein_g' },
    fiber_g: { target: config.targets.fiber_g, label: 'Fibres', key: 'fiber_g' },
  };
}

const NUTRIENT_KEYS = ['vitamin_a_ug', 'vitamin_c_mg', 'vitamin_e_mg', 'calcium_mg', 'iron_mg', 'protein_g', 'fiber_g'];

// ══════════════════════════════════════════════
// CALCULATE DAILY NUTRITION (unchanged logic)
// ══════════════════════════════════════════════

export async function calculateDailyNutrition(date: string) {
  const { supabase, userId } = await getSupabaseAndUser();
  const species = await getUserSpecies(supabase, userId);
  const config = getSpeciesConfig(species);
  const TARGETS = getTargets(species);
  const CATEGORY_IDS = config.categoryIds;

  const { data: meals, error: mealsError } = await supabase
    .from('daily_meals')
    .select(`*, meal_items(*, food:foods(*))`)
    .eq('meal_date', date)
    .eq('user_id', userId);

  if (mealsError) throw mealsError;

  const allItems: any[] = [];
  meals?.forEach((meal: any) => {
    meal.meal_items?.forEach((item: any) => {
      if (item.actually_eaten && item.food) allItems.push(item);
    });
  });

  const nutrients: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => nutrients[k] = 0);

  let totalWeight = 0, fruitWeight = 0, vegetableWeight = 0, supplementWeight = 0;
  let hasBetaCarotene = false, hasSprouts = false, hasPellets = false;
  const uniqueFoods = new Set<string>();
  const completedMeals = new Set<string>();

  allItems.forEach((item) => {
    const weight = item.weight_grams || (item.quantity_tbsp || 0) * 15;
    const food = item.food;
    const ratio = weight / 100;
    uniqueFoods.add(food.id);
    if (food.beta_carotene_rich) hasBetaCarotene = true;
    if (food.category_id === CATEGORY_IDS.germinations) hasSprouts = true;
    if (CATEGORY_IDS.pellets && food.category_id === CATEGORY_IDS.pellets) hasPellets = true;
    totalWeight += weight;
    if (food.category_id === CATEGORY_IDS.fruits) fruitWeight += weight;
    if (food.category_id === CATEGORY_IDS.legumes) vegetableWeight += weight;
    if ([CATEGORY_IDS.complements, CATEGORY_IDS.germinations, CATEGORY_IDS.fleurs].includes(food.category_id))
      supplementWeight += weight;
    NUTRIENT_KEYS.forEach((key) => {
      if (food[key]) nutrients[key] += food[key] * ratio;
    });
  });

  meals?.forEach((meal: any) => {
    if (meal.meal_items?.length > 0) completedMeals.add(meal.meal_time);
  });

  const fruitsPct = totalWeight > 0 ? Math.round((fruitWeight / totalWeight) * 100) : 0;
  const vegetablesPct = totalWeight > 0 ? Math.round((vegetableWeight / totalWeight) * 100) : 0;
  const supplementsPct = totalWeight > 0 ? Math.round((supplementWeight / totalWeight) * 100) : 0;

  const alerts: Alert[] = [];

  // Beta-carotene alert
  if (!hasBetaCarotene && totalWeight > 0) {
    if (species === 'african_grey') {
      alerts.push({ type: 'danger', message: 'Carotte ou patate douce obligatoire aujourd\'hui', icon: '🔴' });
    } else if (species === 'galah') {
      alerts.push({ type: 'danger', message: 'Carotte ou poivron rouge obligatoire aujourd\'hui', icon: '🔴' });
    } else {
      alerts.push({ type: 'danger', message: 'Aucun bêta-carotène dans la journée', icon: '🔴' });
    }
  }

  // Eclectus: sprouts check
  if (species === 'eclectus') {
    const twoDaysAgo = new Date(date);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const { data: recentSprouts } = await supabase
      .from('daily_meals').select('meal_items(food:foods(category_id))')
      .eq('user_id', userId)
      .gte('meal_date', twoDaysAgo.toISOString().split('T')[0])
      .lte('meal_date', date);
    let sproutsFound = false;
    recentSprouts?.forEach((m: any) => m.meal_items?.forEach((i: any) => {
      if (i.food?.category_id === CATEGORY_IDS.germinations) sproutsFound = true;
    }));
    if (!sproutsFound) alerts.push({ type: 'danger', message: 'Germinations absentes depuis > 2 jours', icon: '🔴' });
  }

  // African Grey specific alerts
  if (species === 'african_grey' && totalWeight > 0) {
    const calciumPct = TARGETS.calcium_mg.target > 0 ? (nutrients.calcium_mg / TARGETS.calcium_mg.target) * 100 : 0;
    if (calciumPct < 50) {
      alerts.push({ type: 'danger', message: '⚠️ CRITIQUE : Gris très sensible à l\'hypocalcémie', icon: '🔴' });
    }
    const ironPct = TARGETS.iron_mg.target > 0 ? (nutrients.iron_mg / TARGETS.iron_mg.target) * 100 : 0;
    if (ironPct > 150) {
      alerts.push({ type: 'warning', message: '⚠️ Iron Storage Disease : réduire aliments riches en fer', icon: '🟠' });
    }
    if (!hasPellets) {
      alerts.push({ type: 'warning', message: 'Les pellets doivent constituer 70% du régime', icon: '🟡' });
    }
  }

  // Galah-specific alerts
  if (species === 'galah' && totalWeight > 0) {
    // Fat excess
    let totalFat = 0;
    allItems.forEach((item) => {
      const weight = item.weight_grams || (item.quantity_tbsp || 0) * 15;
      totalFat += (item.food.fat_g || 0) * (weight / 100);
    });
    if (config.targets.fat_max_g && totalFat > config.targets.fat_max_g) {
      alerts.push({ type: 'warning', message: 'Trop de lipides — réduire noix et graines grasses immédiatement', icon: '🟠' });
    }

    // Sunflower/carthame (danger_level >= 2 in graines/céréales category)
    const hasFattySeeds = allItems.some((item) =>
      item.food.danger_level >= 2 && item.food.category_id === CATEGORY_IDS.cereales
    );
    if (hasFattySeeds) {
      alerts.push({ type: 'danger', message: '⚠️ Graines grasses détectées : cause directe de lipomatose chez le Rosalbin', icon: '🔴' });
    }

    // Fruit excess
    if (fruitsPct > 5) {
      alerts.push({ type: 'warning', message: `Fruits trop présents pour le Rosalbin (${fruitsPct}% — max 5%)`, icon: '🟡' });
    }

    // No pellets
    if (!hasPellets) {
      alerts.push({ type: 'warning', message: 'Pellets low-fat indispensables — 70% du régime', icon: '🟡' });
    }
  }

  // Common: forbidden / seed checks
  allItems.forEach((item) => {
    if (item.food.remove_seed && item.seed_removed !== true)
      alerts.push({ type: 'danger', message: `Noyau non confirmé comme retiré : ${item.food.name}`, icon: '🔴' });
    if (item.food.is_forbidden)
      alerts.push({ type: 'danger', message: `Aliment interdit détecté : ${item.food.name}`, icon: '🔴' });
  });

  // Weekly limits check
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - 7);
  const { data: weekMeals } = await supabase
    .from('daily_meals').select('meal_items(food:foods(category_id,name))')
    .eq('user_id', userId)
    .gte('meal_date', weekStart.toISOString().split('T')[0]).lte('meal_date', date);
  let cerealCount = 0, nutCount = 0;
  weekMeals?.forEach((m: any) => m.meal_items?.forEach((i: any) => {
    if (i.food?.category_id === CATEGORY_IDS.cereales) cerealCount++;
    if (i.food?.category_id === CATEGORY_IDS.noix) nutCount++;
  }));
  if (nutCount > 2 || cerealCount > 2)
    alerts.push({ type: 'warning', message: 'Noix/céréales > 2x cette semaine', icon: '🟡' });

  // Fruit/veg ratio (eclectus specific)
  const fruitVegPct = fruitsPct + vegetablesPct;
  if (species === 'eclectus' && fruitVegPct > 0 && (fruitVegPct < 60 || fruitVegPct > 85))
    alerts.push({ type: 'warning', message: `Ratio fruits+légumes déséquilibré (${fruitVegPct}%)`, icon: '🟡' });

  const vitAPercent = TARGETS.vitamin_a_ug.target > 0 ? (nutrients.vitamin_a_ug / TARGETS.vitamin_a_ug.target) * 100 : 0;
  if (vitAPercent < 50 && totalWeight > 0)
    alerts.push({ type: 'warning', message: `Vitamine A < 50% de l'objectif (${Math.round(vitAPercent)}%)`, icon: '🟠' });

  // Score - species aware
  let score = 0;
  const sc = config.scoreConfig;
  if (species === 'african_grey' || species === 'galah') {
    if (hasPellets) score += (sc.pelletsPoints ?? 25);
    if (fruitVegPct >= sc.fruitVegMin) score += 10;
  } else {
    if (fruitVegPct >= sc.fruitVegMin) score += 20;
  }
  if (hasBetaCarotene) score += sc.betaCarotenePoints;
  if (hasSprouts) score += sc.sproutsPoints;
  if (vitAPercent >= 70) score += sc.vitAPoints;
  if (uniqueFoods.size >= sc.diversityMinFoods) score += sc.diversityPoints;
  if (completedMeals.size >= 3) score += sc.completedMealsPoints;
  score = Math.min(score, 100);

  const summary = {
    summary_date: date, user_id: userId,
    actual_vitamin_a_ug: Math.round(nutrients.vitamin_a_ug * 10) / 10,
    actual_vitamin_c_mg: Math.round(nutrients.vitamin_c_mg * 10) / 10,
    actual_vitamin_e_mg: Math.round(nutrients.vitamin_e_mg * 10) / 10,
    actual_calcium_mg: Math.round(nutrients.calcium_mg * 10) / 10,
    actual_iron_mg: Math.round(nutrients.iron_mg * 10) / 10,
    actual_protein_g: Math.round(nutrients.protein_g * 10) / 10,
    actual_fiber_g: Math.round(nutrients.fiber_g * 10) / 10,
    target_vitamin_a_ug: TARGETS.vitamin_a_ug.target,
    target_vitamin_c_mg: TARGETS.vitamin_c_mg.target,
    target_vitamin_e_mg: TARGETS.vitamin_e_mg.target,
    target_calcium_mg: TARGETS.calcium_mg.target,
    target_iron_mg: TARGETS.iron_mg.target,
    target_protein_g: TARGETS.protein_g.target,
    target_fiber_g: TARGETS.fiber_g.target,
    fruits_pct: fruitsPct, vegetables_pct: vegetablesPct, supplements_pct: supplementsPct,
    balance_score: score, has_beta_carotene: hasBetaCarotene, has_sprouts: hasSprouts, alerts,
  };

  const { data, error } = await supabase
    .from('daily_nutrition_summary')
    .upsert(summary, { onConflict: 'user_id,summary_date' })
    .select().single();
  if (error) throw error;
  return data;
}

// ══════════════════════════════════════════════
// SEASONALITY HELPERS
// ══════════════════════════════════════════════

async function getSeasonalFoodIds(supabase: any, month: number): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('food_seasonality')
      .select('food_id')
      .eq('month', month);
    if (error) return new Set(); // Table may not exist yet
    return new Set((data ?? []).map((r: any) => r.food_id));
  } catch {
    return new Set();
  }
}

function computeNutrients(food: any, qty_tbsp: number): Record<string, number> {
  const ratio = (qty_tbsp * 15) / 100;
  const result: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => result[k] = (food[k] || 0) * ratio);
  return result;
}

function addNutrients(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const r: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => r[k] = (a[k] || 0) + (b[k] || 0));
  return r;
}

function computeNutritionScore(nutrients: Record<string, number>, targets: Record<string, { target: number }>): number {
  let totalPct = 0;
  NUTRIENT_KEYS.forEach(k => {
    const target = targets[k]?.target || 1;
    totalPct += Math.min((nutrients[k] || 0) / target, 1) * 100;
  });
  return Math.round(totalPct / NUTRIENT_KEYS.length);
}

// ══════════════════════════════════════════════
// INTELLIGENT MEAL GENERATION (Mod 2 + 4)
// ══════════════════════════════════════════════

export async function generateDailyMealSuggestion(date: string) {
  const { supabase, userId } = await getSupabaseAndUser();
  const species = await getUserSpecies(supabase, userId);
  const config = getSpeciesConfig(species);
  const TARGETS = getTargets(species);
  const CATEGORY_IDS = config.categoryIds;
  const currentMonth = new Date(date).getMonth() + 1;

  // Check if already generated today
  const { data: existingRecommended } = await supabase
    .from('daily_meals')
    .select('id')
    .eq('meal_date', date)
    .eq('user_id', userId)
    .eq('is_recommended', true)
    .limit(1);

  if (existingRecommended && existingRecommended.length > 0) {
    return { alreadyGenerated: true };
  }

  // ── STEP 1: Analyze last 7 days of ACTUAL eating ──
  const weekAgo = new Date(date);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: recentMealsData } = await supabase
    .from('daily_meals')
    .select('meal_items(food_id, actually_eaten, food:foods(name, category_id))')
    .eq('user_id', userId)
    .gte('meal_date', weekAgo.toISOString().split('T')[0])
    .lt('meal_date', date);

  const foodFreq: Record<string, { count: number; name: string; catId: string }> = {};
  recentMealsData?.forEach((meal: any) => {
    meal.meal_items?.forEach((item: any) => {
      if (item.actually_eaten && item.food_id) {
        if (!foodFreq[item.food_id]) foodFreq[item.food_id] = { count: 0, name: item.food?.name || '', catId: item.food?.category_id || '' };
        foodFreq[item.food_id].count++;
      }
    });
  });

  // Week counts for cereals, nuts, sweet fruits
  let weekCerealCount = 0, weekNutCount = 0, weekSweetFruitCount = 0;
  const SWEET_FRUITS = ['Banane', 'Raisin'];
  Object.values(foodFreq).forEach(f => {
    if (f.catId === CATEGORY_IDS.cereales) weekCerealCount += f.count;
    if (f.catId === CATEGORY_IDS.noix) weekNutCount += f.count;
    if (SWEET_FRUITS.some(s => f.name.includes(s))) weekSweetFruitCount += f.count;
  });

  // ── STEP 2: Analyze yesterday's deficiencies ──
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const { data: yesterdaySummary } = await supabase
    .from('daily_nutrition_summary')
    .select('*')
    .eq('summary_date', yesterdayStr)
    .eq('user_id', userId)
    .single();

  const nutrientDeficits: Record<string, number> = {};
  if (yesterdaySummary) {
    NUTRIENT_KEYS.forEach(k => {
      const actual = (yesterdaySummary as any)[`actual_${k}`] || 0;
      const target = TARGETS[k]?.target || 1;
      const pct = (actual / target) * 100;
      if (pct < 70) nutrientDeficits[k] = Math.round(100 - pct);
    });
  }

  // ── STEP 3: Get all safe foods with seasonality info (species-filtered) ──
  const { data: allFoods } = await supabase
    .from('foods')
    .select('*, category:food_categories(*)')
    .eq('is_forbidden', false)
    .eq('species', species)
    .order('name');

  if (!allFoods || allFoods.length === 0) return null;

  const seasonalIds = await getSeasonalFoodIds(supabase, currentMonth);

  // Score each food
  const scoredFoods = allFoods.map((food: any) => {
    const freq = foodFreq[food.id]?.count || 0;
    const isSeasonal = seasonalIds.has(food.id);
    // Categories without seasonality (germinations, cereals, nuts, flowers, complements) are always "in season"
    const noSeasonCategory = [CATEGORY_IDS.germinations, CATEGORY_IDS.cereales, CATEGORY_IDS.noix, CATEGORY_IDS.fleurs, CATEGORY_IDS.complements].includes(food.category_id);
    const effectivelySeasonal = isSeasonal || noSeasonCategory;

    let score = 0;
    // Diversity bonus: never given in 7 days = +30, 1x = +15, 2x = +5
    if (freq === 0) score += 30;
    else if (freq === 1) score += 15;
    else if (freq === 2) score += 5;
    // Repetition penalty: ≥3x in 7 days = -50
    if (freq >= 3) score -= 50;
    // Season bonus
    if (effectivelySeasonal) score += 20;
    else score -= 10; // mild penalty for out-of-season

    // Deficiency priority scoring
    NUTRIENT_KEYS.forEach(k => {
      if (nutrientDeficits[k] && food[k]) {
        score += Math.min(nutrientDeficits[k], 50) * (food[k] / (TARGETS[k]?.target || 1));
      }
    });

    // Beta-carotene bonus
    if (food.beta_carotene_rich) score += 10;

    return { ...food, _score: score, _seasonal: effectivelySeasonal, _freq: freq };
  });

  // Group by category
  const byCategory: Record<string, any[]> = {};
  scoredFoods.forEach((f: any) => {
    if (!byCategory[f.category_id]) byCategory[f.category_id] = [];
    byCategory[f.category_id].push(f);
  });
  // Sort each category by score desc
  Object.values(byCategory).forEach(arr => arr.sort((a: any, b: any) => b._score - a._score));

  // ── STEP 3b: Select foods with constraints ──
  function pickTop(arr: any[], count: number, requireBeta = false): any[] {
    const result: any[] = [];
    if (requireBeta) {
      const betaFirst = arr.find((f: any) => f.beta_carotene_rich && !result.includes(f));
      if (betaFirst) result.push(betaFirst);
    }
    for (const f of arr) {
      if (result.length >= count) break;
      if (!result.find(r => r.id === f.id)) result.push(f);
    }
    return result;
  }

  const fruits = pickTop(byCategory[CATEGORY_IDS.fruits] || [], 3, true);
  const vegetables = pickTop(byCategory[CATEGORY_IDS.legumes] || [], 3, true);
  const sprouts = (byCategory[CATEGORY_IDS.germinations] || [])[0];
  const cereal = weekCerealCount < 2 ? pickTop(byCategory[CATEGORY_IDS.cereales] || [], 1) : [];
  const nut = weekNutCount < 2 ? pickTop(byCategory[CATEGORY_IDS.noix] || [], 1) : [];

  // ── STEP 4: Distribute across 3 meals with INTER-MEAL OPTIMIZATION (Mod 4) ──
  const mealPlan: Record<string, { food: any; quantity_tbsp: number }[]> = { matin: [], midi: [], soir: [] };
  let cumulativeNutrients: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => cumulativeNutrients[k] = 0);

  // MATIN: germinations + 1 fruit beta + 1 légume doux + complement if needed
  if (sprouts) mealPlan.matin.push({ food: sprouts, quantity_tbsp: 2 });
  const fruitBeta = fruits.find((f: any) => f.beta_carotene_rich) || fruits[0];
  if (fruitBeta) mealPlan.matin.push({ food: fruitBeta, quantity_tbsp: 1.5 });
  const vegDoux = vegetables.find((f: any) => !f.beta_carotene_rich) || vegetables[0];
  if (vegDoux) mealPlan.matin.push({ food: vegDoux, quantity_tbsp: 1.5 });

  // Calculate matin nutrients
  mealPlan.matin.forEach(item => {
    cumulativeNutrients = addNutrients(cumulativeNutrients, computeNutrients(item.food, item.quantity_tbsp));
  });

  // MIDI: 2 légumes (1 beta) + 1 fruit + cereal → maximize remaining deficits
  const remainingAfterMatin: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => remainingAfterMatin[k] = Math.max(0, (TARGETS[k]?.target || 0) - cumulativeNutrients[k]));

  const vegBeta = vegetables.find((f: any) => f.beta_carotene_rich && f.id !== vegDoux?.id) || vegetables[1];
  if (vegBeta) mealPlan.midi.push({ food: vegBeta, quantity_tbsp: 1.5 });
  const vegMidi2 = vegetables.find((f: any) => f.id !== vegBeta?.id && f.id !== vegDoux?.id) || vegetables[2];
  if (vegMidi2) mealPlan.midi.push({ food: vegMidi2, quantity_tbsp: 1 });
  const fruitMidi = fruits.find((f: any) => f.id !== fruitBeta?.id) || fruits[1];
  if (fruitMidi) mealPlan.midi.push({ food: fruitMidi, quantity_tbsp: 1 });
  if (cereal.length > 0) mealPlan.midi.push({ food: cereal[0], quantity_tbsp: 1 });

  mealPlan.midi.forEach(item => {
    cumulativeNutrients = addNutrients(cumulativeNutrients, computeNutrients(item.food, item.quantity_tbsp));
  });

  // SOIR: 1 fruit + 2 légumes variés + noix → cover remaining
  const fruitSoir = fruits.find((f: any) => f.id !== fruitBeta?.id && f.id !== fruitMidi?.id) || fruits[2] || fruits[0];
  if (fruitSoir) mealPlan.soir.push({ food: fruitSoir, quantity_tbsp: 1 });
  // Pick vegetables that best cover remaining deficits
  const usedVegIds = new Set([vegDoux?.id, vegBeta?.id, vegMidi2?.id]);
  const remainingVegs = (byCategory[CATEGORY_IDS.legumes] || []).filter((f: any) => !usedVegIds.has(f.id));
  const vegSoir1 = remainingVegs[0] || vegetables[0];
  const vegSoir2 = remainingVegs[1] || vegetables[1];
  if (vegSoir1) mealPlan.soir.push({ food: vegSoir1, quantity_tbsp: 1.5 });
  if (vegSoir2) mealPlan.soir.push({ food: vegSoir2, quantity_tbsp: 1 });
  if (nut.length > 0) mealPlan.soir.push({ food: nut[0], quantity_tbsp: 0.5 });

  mealPlan.soir.forEach(item => {
    cumulativeNutrients = addNutrients(cumulativeNutrients, computeNutrients(item.food, item.quantity_tbsp));
  });

  // ── STEP 5: Verification & forced additions ──
  const forced: string[] = [];
  const vitAPct = (cumulativeNutrients.vitamin_a_ug / TARGETS.vitamin_a_ug.target) * 100;
  if (vitAPct < 60) {
    const carrot = allFoods.find((f: any) => f.name === 'Carotte');
    if (carrot && !Object.values(mealPlan).flat().find(i => i.food.id === carrot.id)) {
      mealPlan.soir.push({ food: carrot, quantity_tbsp: 1 });
      cumulativeNutrients = addNutrients(cumulativeNutrients, computeNutrients(carrot, 1));
      forced.push('Carotte (Vit A < 60%)');
    }
  }
  const protPct = (cumulativeNutrients.protein_g / TARGETS.protein_g.target) * 100;
  if (protPct < 50 && sprouts) {
    mealPlan.midi.push({ food: sprouts, quantity_tbsp: 1 });
    cumulativeNutrients = addNutrients(cumulativeNutrients, computeNutrients(sprouts, 1));
    forced.push('Germinations supplémentaires (protéines < 50%)');
  }
  const fiberPct = (cumulativeNutrients.fiber_g / TARGETS.fiber_g.target) * 100;
  if (fiberPct < 50) {
    const brocoli = allFoods.find((f: any) => f.name === 'Brocoli');
    if (brocoli && !Object.values(mealPlan).flat().find(i => i.food.id === brocoli.id)) {
      mealPlan.soir.push({ food: brocoli, quantity_tbsp: 1 });
      cumulativeNutrients = addNutrients(cumulativeNutrients, computeNutrients(brocoli, 1));
      forced.push('Brocoli (fibres < 50%)');
    }
  }

  // ── STEP 6: Build generation_reason ──
  const avoidedRepeats = Object.entries(foodFreq)
    .filter(([, v]) => v.count >= 3)
    .map(([, v]) => v.name);

  const seasonalPicks = Object.values(mealPlan).flat()
    .filter(item => seasonalIds.has(item.food.id))
    .map(item => item.food.name);

  const explanationLines: string[] = [];
  if (Object.keys(nutrientDeficits).length > 0) {
    const deficitNames = Object.entries(nutrientDeficits)
      .map(([k, v]) => `${TARGETS[k]?.label} (${v}% manquant)`)
      .join(', ');
    explanationLines.push(`Hier, il manquait : ${deficitNames}`);
  }
  if (seasonalPicks.length > 0) {
    explanationLines.push(`De saison ce mois-ci : ${seasonalPicks.join(', ')}`);
  }
  if (avoidedRepeats.length > 0) {
    explanationLines.push(`Évités (donnés ≥3x cette semaine) : ${avoidedRepeats.join(', ')}`);
  }
  if (forced.length > 0) {
    explanationLines.push(`Ajouts forcés : ${forced.join(', ')}`);
  }

  const generationReason: GenerationReason = {
    vitA_deficit_yesterday: nutrientDeficits.vitamin_a_ug || 0,
    nutrient_deficits: nutrientDeficits,
    avoided_repeats: avoidedRepeats,
    seasonal_picks: seasonalPicks,
    forced_additions: forced,
    explanation_lines: explanationLines,
  };

  const nutritionScore = computeNutritionScore(cumulativeNutrients, TARGETS);

  return {
    alreadyGenerated: false,
    mealPlan,
    estimatedNutrients: cumulativeNutrients,
    generationReason,
    nutritionScore,
  };
}

// ══════════════════════════════════════════════
// SAVE GENERATED MEAL PLAN
// ══════════════════════════════════════════════

export async function saveGeneratedMealPlan(
  date: string,
  mealPlan: Record<string, { food: any; quantity_tbsp: number }[]>,
  generationReason: GenerationReason,
  nutritionScore: number
) {
  const { supabase, userId } = await getSupabaseAndUser();

  for (const [mealTime, items] of Object.entries(mealPlan)) {
    const { data: existing } = await supabase
      .from('daily_meals').select('id')
      .eq('meal_date', date).eq('meal_time', mealTime)
      .eq('user_id', userId).eq('is_recommended', true)
      .single();

    let mealId: string;
    if (existing) {
      mealId = existing.id;
      // Try to update reason/score (columns may not exist yet)
      try {
        await supabase.from('daily_meals').update({
          generation_reason: generationReason,
          generation_nutrition_score: nutritionScore,
        }).eq('id', mealId);
      } catch { /* columns may not exist */ }
    } else {
      // Try with new columns first, fallback without
      let newMeal: any;
      const { data: d1, error: e1 } = await supabase
        .from('daily_meals')
        .insert({
          meal_date: date,
          meal_time: mealTime,
          is_recommended: true,
          user_id: userId,
          generation_reason: generationReason,
          generation_nutrition_score: nutritionScore,
        })
        .select().single();
      if (e1) {
        // Fallback without new columns
        const { data: d2, error: e2 } = await supabase
          .from('daily_meals')
          .insert({
            meal_date: date,
            meal_time: mealTime,
            is_recommended: true,
            user_id: userId,
          })
          .select().single();
        if (e2) throw e2;
        newMeal = d2;
      } else {
        newMeal = d1;
      }
      mealId = newMeal.id;
    }

    for (const item of items) {
      await supabase.from('meal_items').insert({
        meal_id: mealId,
        food_id: item.food.id,
        quantity_tbsp: item.quantity_tbsp,
        weight_grams: item.quantity_tbsp * 15,
        seed_removed: item.food.remove_seed ? false : null,
        user_id: userId,
      });
    }
  }

  await calculateDailyNutrition(date);
}

// ══════════════════════════════════════════════
// AUTO-GENERATE ON PAGE LOAD
// ══════════════════════════════════════════════

export async function ensureDailyMealGenerated(date: string) {
  const result = await generateDailyMealSuggestion(date);
  if (!result || result.alreadyGenerated) return result;

  // Save automatically
  await saveGeneratedMealPlan(date, result.mealPlan!, result.generationReason!, result.nutritionScore!);
  return result;
}

// ══════════════════════════════════════════════
// RECALCULATE (regenerate) — only if no real meals
// ══════════════════════════════════════════════

export async function regenerateMealSuggestion(date: string) {
  const { supabase, userId } = await getSupabaseAndUser();

  // Check if any non-recommended meals exist (user entered real data)
  const { data: realMeals } = await supabase
    .from('daily_meals')
    .select('id')
    .eq('meal_date', date)
    .eq('user_id', userId)
    .eq('is_recommended', false)
    .limit(1);

  if (realMeals && realMeals.length > 0) {
    throw new Error('Des repas réels sont déjà enregistrés — impossible de recalculer.');
  }

  // Delete existing recommended meals
  const { data: existingRec } = await supabase
    .from('daily_meals')
    .select('id')
    .eq('meal_date', date)
    .eq('user_id', userId)
    .eq('is_recommended', true);

  for (const meal of existingRec || []) {
    await supabase.from('meal_items').delete().eq('meal_id', meal.id);
    await supabase.from('daily_meals').delete().eq('id', meal.id);
  }

  // Re-generate
  const result = await generateDailyMealSuggestion(date);
  if (!result || result.alreadyGenerated) return result;
  await saveGeneratedMealPlan(date, result.mealPlan!, result.generationReason!, result.nutritionScore!);
  return result;
}

// ══════════════════════════════════════════════
// GET SEASONALITY FOR CLIENT
// ══════════════════════════════════════════════

export async function getSeasonalFoodIdsForMonth(month: number): Promise<string[]> {
  try {
    const { supabase } = await getSupabaseAndUser();
    const { data, error } = await supabase
      .from('food_seasonality')
      .select('food_id')
      .eq('month', month);
    if (error) return [];
    return (data ?? []).map((r: any) => r.food_id);
  } catch {
    return [];
  }
}

// ══════════════════════════════════════════════
// UPLOAD MEAL PHOTO
// ══════════════════════════════════════════════

export async function uploadMealPhoto(mealId: string, photoPath: string) {
  const { supabase, userId } = await getSupabaseAndUser();
  await supabase
    .from('daily_meals')
    .update({ photo_url: photoPath, photo_taken_at: new Date().toISOString() })
    .eq('id', mealId)
    .eq('user_id', userId);
}

export async function deleteMealPhoto(mealId: string) {
  const { supabase, userId } = await getSupabaseAndUser();
  const { data: meal } = await supabase
    .from('daily_meals')
    .select('photo_url')
    .eq('id', mealId)
    .eq('user_id', userId)
    .single();

  if (meal?.photo_url) {
    await supabase.storage.from('meal-photos').remove([meal.photo_url]);
  }

  await supabase
    .from('daily_meals')
    .update({ photo_url: null, photo_taken_at: null })
    .eq('id', mealId)
    .eq('user_id', userId);
}
