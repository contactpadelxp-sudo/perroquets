import type { DailyMeal, MealItem, Food, Alert } from '@/types/database';

const NUTRIENT_KEYS = [
  'vitamin_a_ug', 'vitamin_c_mg', 'vitamin_e_mg',
  'calcium_mg', 'iron_mg', 'protein_g', 'fiber_g',
] as const;

const TARGETS: Record<string, number> = {
  vitamin_a_ug: 800,
  vitamin_c_mg: 50,
  vitamin_e_mg: 5,
  calcium_mg: 150,
  iron_mg: 3,
  protein_g: 12,
  fiber_g: 8,
};

const CATEGORY_IDS = {
  fruits: 'a1000000-0000-0000-0000-000000000001',
  legumes: 'a1000000-0000-0000-0000-000000000002',
  germinations: 'a1000000-0000-0000-0000-000000000003',
  cereales: 'a1000000-0000-0000-0000-000000000004',
  noix: 'a1000000-0000-0000-0000-000000000005',
  fleurs: 'a1000000-0000-0000-0000-000000000006',
  complements: 'a1000000-0000-0000-0000-000000000007',
};

export interface NutritionSummary {
  nutrients: Record<string, number>;
  targets: Record<string, number>;
  fruitsPct: number;
  vegetablesPct: number;
  supplementsPct: number;
  balanceScore: number;
  hasBetaCarotene: boolean;
  hasSprouts: boolean;
  alerts: Alert[];
  uniqueFoodCount: number;
  completedMealCount: number;
}

/**
 * Calculate nutrition summary from meals loaded client-side.
 * Only counts items where actually_eaten === true.
 * Does NOT invent any food — purely based on meal_items in the provided meals.
 */
export function calculateNutritionFromMeals(meals: DailyMeal[]): NutritionSummary {
  const nutrients: Record<string, number> = {};
  NUTRIENT_KEYS.forEach(k => nutrients[k] = 0);

  let totalWeight = 0, fruitWeight = 0, vegetableWeight = 0, supplementWeight = 0;
  let hasBetaCarotene = false, hasSprouts = false;
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
      if (food.category_id === CATEGORY_IDS.germinations) hasSprouts = true;

      totalWeight += weight;
      if (food.category_id === CATEGORY_IDS.fruits) fruitWeight += weight;
      if (food.category_id === CATEGORY_IDS.legumes) vegetableWeight += weight;
      if ([CATEGORY_IDS.complements, CATEGORY_IDS.germinations, CATEGORY_IDS.fleurs].includes(food.category_id || '')) {
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

  // Alerts
  const alerts: Alert[] = [];
  if (!hasBetaCarotene && totalWeight > 0)
    alerts.push({ type: 'danger', message: 'Aucun bêta-carotène dans la journée', icon: '🔴' });
  if (!hasSprouts && totalWeight > 0)
    alerts.push({ type: 'danger', message: 'Pas de germinations aujourd\'hui', icon: '🔴' });

  const fruitVegPct = fruitsPct + vegetablesPct;
  if (fruitVegPct > 0 && (fruitVegPct < 60 || fruitVegPct > 85))
    alerts.push({ type: 'warning', message: `Ratio fruits+légumes déséquilibré (${fruitVegPct}%)`, icon: '🟡' });

  const vitAPct = TARGETS.vitamin_a_ug > 0 ? (nutrients.vitamin_a_ug / TARGETS.vitamin_a_ug) * 100 : 0;
  if (vitAPct < 50 && totalWeight > 0)
    alerts.push({ type: 'warning', message: `Vitamine A < 50% de l'objectif (${Math.round(vitAPct)}%)`, icon: '🟠' });

  // Score
  let score = 0;
  if (fruitVegPct >= 60) score += 20;
  if (hasBetaCarotene) score += 20;
  if (hasSprouts) score += 20;
  if (vitAPct >= 70) score += 20;
  if (uniqueFoods.size >= 5) score += 10;
  if (completedMeals.size >= 3) score += 10;

  return {
    nutrients,
    targets: { ...TARGETS },
    fruitsPct,
    vegetablesPct,
    supplementsPct,
    balanceScore: score,
    hasBetaCarotene,
    hasSprouts,
    alerts,
    uniqueFoodCount: uniqueFoods.size,
    completedMealCount: completedMeals.size,
  };
}
