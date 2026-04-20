import type { DailyMeal, Alert } from '@/types/database';
import type { SpeciesConfig, SpeciesId } from './species';
import { getSpeciesConfig } from './species';

const NUTRIENT_KEYS = [
  'vitamin_a_ug', 'vitamin_c_mg', 'vitamin_e_mg',
  'calcium_mg', 'iron_mg', 'protein_g', 'fiber_g',
] as const;

export interface NutritionSummary {
  nutrients: Record<string, number>;
  targets: Record<string, number>;
  fruitsPct: number;
  vegetablesPct: number;
  supplementsPct: number;
  pelletsPct: number;
  balanceScore: number;
  hasBetaCarotene: boolean;
  hasSprouts: boolean;
  hasPellets: boolean;
  alerts: Alert[];
  uniqueFoodCount: number;
  completedMealCount: number;
}

/**
 * Calculate nutrition summary from meals loaded client-side.
 * Only counts items where actually_eaten === true.
 * Species-aware: uses species config for targets, alerts, and scoring.
 */
export function calculateNutritionFromMeals(meals: DailyMeal[], species?: SpeciesId | string): NutritionSummary {
  const config = getSpeciesConfig(species);
  const catIds = config.categoryIds;

  const nutrients: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => nutrients[k] = 0);

  let totalWeight = 0, fruitWeight = 0, vegetableWeight = 0, supplementWeight = 0, pelletsWeight = 0;
  let hasBetaCarotene = false, hasSprouts = false, hasPellets = false;
  const uniqueFoods = new Set<string>();
  const completedMeals = new Set<string>();

  meals.forEach((meal) => {
    const items = meal.meal_items ?? [];
    const eatenItems = items.filter((item) => item.actually_eaten && item.food);

    if (eatenItems.length > 0) completedMeals.add(meal.meal_time);

    eatenItems.forEach((item) => {
      const food = item.food!;
      const weight = item.weight_grams || (item.quantity_tbsp || 0) * 15;
      const ratio = weight / 100;

      uniqueFoods.add(food.id);

      if (food.beta_carotene_rich) hasBetaCarotene = true;
      if (food.category_id === catIds.germinations) hasSprouts = true;
      if (catIds.pellets && food.category_id === catIds.pellets) hasPellets = true;

      totalWeight += weight;
      if (food.category_id === catIds.fruits) fruitWeight += weight;
      if (food.category_id === catIds.legumes) vegetableWeight += weight;
      if (catIds.pellets && food.category_id === catIds.pellets) pelletsWeight += weight;
      if ([catIds.complements, catIds.germinations, catIds.fleurs].includes(food.category_id || '')) {
        supplementWeight += weight;
      }

      NUTRIENT_KEYS.forEach((key) => {
        const val = (food as any)[key];
        if (val) nutrients[key] += val * ratio;
      });
    });
  });

  const fruitsPct = totalWeight > 0 ? Math.round((fruitWeight / totalWeight) * 100) : 0;
  const vegetablesPct = totalWeight > 0 ? Math.round((vegetableWeight / totalWeight) * 100) : 0;
  const supplementsPct = totalWeight > 0 ? Math.round((supplementWeight / totalWeight) * 100) : 0;
  const pelletsPct = totalWeight > 0 ? Math.round((pelletsWeight / totalWeight) * 100) : 0;

  // Build targets from species config
  const targets: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => {
    const val = config.targets[k as keyof typeof config.targets];
    if (val !== undefined) targets[k] = val;
  });

  // Alerts
  const alerts: Alert[] = [];

  // Common alerts
  if (!hasBetaCarotene && totalWeight > 0) {
    if (config.id === 'african_grey') {
      alerts.push({ type: 'danger', message: 'Carotte ou patate douce obligatoire aujourd\'hui — carence Vit A = pathologie n°1', icon: '🔴' });
    } else if (config.id === 'galah') {
      alerts.push({ type: 'danger', message: 'Carotte ou poivron rouge obligatoire aujourd\'hui', icon: '🔴' });
    } else {
      alerts.push({ type: 'danger', message: 'Aucun bêta-carotène dans la journée', icon: '🔴' });
    }
  }

  // Eclectus-specific: sprouts check
  if (config.id === 'eclectus' && !hasSprouts && totalWeight > 0) {
    alerts.push({ type: 'danger', message: 'Pas de germinations aujourd\'hui', icon: '🔴' });
  }

  // African Grey-specific alerts
  if (config.id === 'african_grey' && totalWeight > 0) {
    const calciumPct = targets.calcium_mg > 0 ? (nutrients.calcium_mg / targets.calcium_mg) * 100 : 0;
    if (calciumPct < 50) {
      alerts.push({ type: 'danger', message: '⚠️ CRITIQUE : Gris très sensible à l\'hypocalcémie — ajouter pissenlit, kale ou brocoli', icon: '🔴' });
    }
    const ironPct = targets.iron_mg > 0 ? (nutrients.iron_mg / targets.iron_mg) * 100 : 0;
    if (ironPct > 150) {
      alerts.push({ type: 'warning', message: '⚠️ Iron Storage Disease : réduire aliments riches en fer (lentilles, épinards)', icon: '🟠' });
    }
    if (!hasPellets) {
      alerts.push({ type: 'warning', message: 'Les pellets doivent constituer 70% du régime — en avez-vous donné aujourd\'hui ?', icon: '🟡' });
    }
    const seedWeight = meals.reduce((acc, meal) => {
      return acc + (meal.meal_items ?? [])
        .filter(i => i.actually_eaten && i.food?.category_id === catIds.noix)
        .reduce((s, i) => s + (i.weight_grams || (i.quantity_tbsp || 0) * 15), 0);
    }, 0);
    const seedPct = totalWeight > 0 ? (seedWeight / totalWeight) * 100 : 0;
    if (seedPct > 30) {
      alerts.push({ type: 'warning', message: 'Trop de graines sèches — remplacer par des pellets de qualité', icon: '🟡' });
    }
  }

  // Galah-specific alerts
  if (config.id === 'galah' && totalWeight > 0) {
    // Fat excess check
    const totalFat = meals.reduce((acc, meal) => {
      return acc + (meal.meal_items ?? [])
        .filter(i => i.actually_eaten && i.food)
        .reduce((s, i) => {
          const w = i.weight_grams || (i.quantity_tbsp || 0) * 15;
          return s + ((i.food as any).fat_g || 0) * (w / 100);
        }, 0);
    }, 0);
    if (config.targets.fat_max_g && totalFat > config.targets.fat_max_g) {
      alerts.push({ type: 'warning', message: 'Trop de lipides — réduire noix et graines grasses immédiatement', icon: '🟠' });
    }

    // Sunflower/carthame detection (danger_level >= 2 in graines category)
    const hasFattySeeds = meals.some(meal =>
      (meal.meal_items ?? []).some(i =>
        i.actually_eaten && i.food && i.food.danger_level >= 2 &&
        i.food.category_id === catIds.cereales
      )
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

  // Common: fruit+veg ratio check
  const fruitVegPct = fruitsPct + vegetablesPct;
  if (config.id === 'eclectus') {
    if (fruitVegPct > 0 && (fruitVegPct < 60 || fruitVegPct > 85))
      alerts.push({ type: 'warning', message: `Ratio fruits+légumes déséquilibré (${fruitVegPct}%)`, icon: '🟡' });
  }

  // Common: Vitamin A check
  const vitAPct = targets.vitamin_a_ug > 0 ? (nutrients.vitamin_a_ug / targets.vitamin_a_ug) * 100 : 0;
  if (vitAPct < 50 && totalWeight > 0) {
    alerts.push({ type: 'warning', message: `Vitamine A < 50% de l'objectif (${Math.round(vitAPct)}%)`, icon: '🟠' });
  }

  // Score calculation - species aware
  let score = 0;
  const sc = config.scoreConfig;

  if (config.id === 'eclectus') {
    if (fruitVegPct >= sc.fruitVegMin) score += 20;
  } else if (config.id === 'african_grey' || config.id === 'galah') {
    // For pellet-based species, score based on pellets
    if (hasPellets) score += (sc.pelletsPoints ?? 25);
    if (fruitVegPct >= sc.fruitVegMin) score += 10;
  }

  if (hasBetaCarotene) score += sc.betaCarotenePoints;
  if (hasSprouts) score += sc.sproutsPoints;
  if (vitAPct >= 70) score += sc.vitAPoints;
  if (uniqueFoods.size >= sc.diversityMinFoods) score += sc.diversityPoints;
  if (completedMeals.size >= 3) score += sc.completedMealsPoints;

  // Cap at 100
  score = Math.min(score, 100);

  return {
    nutrients,
    targets,
    fruitsPct,
    vegetablesPct,
    supplementsPct,
    pelletsPct,
    balanceScore: score,
    hasBetaCarotene,
    hasSprouts,
    hasPellets,
    alerts,
    uniqueFoodCount: uniqueFoods.size,
    completedMealCount: completedMeals.size,
  };
}
