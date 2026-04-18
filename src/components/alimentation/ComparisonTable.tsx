'use client';

import { useMemo } from 'react';
import type { DailyMeal } from '@/types/database';
import { calculateNutritionFromMeals } from '@/lib/nutrition';
import { NutrientBar } from '@/components/ui/NutrientBar';

const NUTRIENTS = [
  { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg', target: 800 },
  { key: 'vitamin_c_mg', label: 'Vitamine C', unit: 'mg', target: 50 },
  { key: 'vitamin_e_mg', label: 'Vitamine E', unit: 'mg', target: 5 },
  { key: 'calcium_mg', label: 'Calcium', unit: 'mg', target: 150 },
  { key: 'iron_mg', label: 'Fer', unit: 'mg', target: 3 },
  { key: 'protein_g', label: 'Protéines', unit: 'g', target: 12 },
  { key: 'fiber_g', label: 'Fibres', unit: 'g', target: 8 },
];

interface ComparisonTableProps {
  recommendedMeals: DailyMeal[];
  registeredMeals: DailyMeal[];
}

export function ComparisonTable({ recommendedMeals, registeredMeals }: ComparisonTableProps) {
  const suggestedNutrition = useMemo(() => calculateNutritionFromMeals(recommendedMeals), [recommendedMeals]);
  const registeredNutrition = useMemo(() => calculateNutritionFromMeals(registeredMeals), [registeredMeals]);

  // Build food lists for comparison
  const suggestedFoods = new Map<string, { name: string; qty: number; icon: string }>();
  recommendedMeals.forEach(meal => {
    meal.meal_items?.forEach(item => {
      if (!item.food) return;
      const existing = suggestedFoods.get(item.food.id);
      suggestedFoods.set(item.food.id, {
        name: item.food.name,
        qty: (existing?.qty || 0) + (item.quantity_tbsp || 1),
        icon: item.food.category?.icon ?? '🍽️',
      });
    });
  });

  const registeredFoods = new Map<string, { name: string; qty: number; icon: string }>();
  registeredMeals.forEach(meal => {
    meal.meal_items?.forEach(item => {
      if (!item.food || !item.actually_eaten) return;
      const existing = registeredFoods.get(item.food.id);
      registeredFoods.set(item.food.id, {
        name: item.food.name,
        qty: (existing?.qty || 0) + (item.quantity_tbsp || 1),
        icon: item.food.category?.icon ?? '🍽️',
      });
    });
  });

  if (recommendedMeals.length === 0 && registeredMeals.length === 0) {
    return null;
  }

  return (
    <div className="card-static overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">📋 Comparaison Suggéré vs Enregistré</h3>
      </div>

      {/* Food comparison */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Suggested */}
        <div className="p-3 space-y-1">
          <h4 className="text-xs font-semibold text-accent-violet mb-2">Suggéré</h4>
          {suggestedFoods.size === 0 ? (
            <p className="text-xs text-muted">Aucune suggestion</p>
          ) : (
            [...suggestedFoods.values()].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span>{f.icon}</span>
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-muted">{f.qty} càs</span>
              </div>
            ))
          )}
        </div>

        {/* Registered */}
        <div className="p-3 space-y-1">
          <h4 className="text-xs font-semibold text-accent-green mb-2">Enregistré</h4>
          {registeredFoods.size === 0 ? (
            <p className="text-xs text-muted">Aucun aliment enregistré</p>
          ) : (
            [...registeredFoods.values()].map((f, i) => {
              const inSuggested = [...suggestedFoods.values()].some(s => s.name === f.name);
              return (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span>{inSuggested ? '✅' : '➕'}</span>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-muted">{f.qty} càs</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Nutritional comparison */}
      <div className="p-4 border-t border-border space-y-3">
        <h4 className="text-xs font-semibold text-muted">Apport nutritionnel : enregistré vs besoins journaliers</h4>
        {NUTRIENTS.map(n => {
          const actual = registeredNutrition.nutrients[n.key] ?? 0;
          return (
            <NutrientBar
              key={n.key}
              label={n.label}
              actual={actual}
              target={n.target}
              unit={n.unit}
              critical={n.key === 'vitamin_a_ug'}
            />
          );
        })}
      </div>
    </div>
  );
}
