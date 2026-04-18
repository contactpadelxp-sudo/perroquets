'use client';

import type { DailyMeal } from '@/types/database';

interface ComparisonTableProps {
  recommendedMeals: DailyMeal[];
  registeredMeals: DailyMeal[];
}

export function ComparisonTable({ recommendedMeals, registeredMeals }: ComparisonTableProps) {
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

    </div>
  );
}
