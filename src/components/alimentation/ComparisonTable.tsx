'use client';

import type { DailyMeal } from '@/types/database';

interface ComparisonTableProps {
  recommendedMeals: DailyMeal[];
}

export function ComparisonTable({ recommendedMeals }: ComparisonTableProps) {
  if (recommendedMeals.length === 0) {
    return (
      <div className="card-static p-4">
        <p className="text-sm text-muted text-center py-4">
          Aucune gamelle recommandée pour ce jour.
        </p>
      </div>
    );
  }

  // Build list of recommended items with their eaten status
  // All data comes from the recommended meals themselves (meal_items.actually_eaten)
  const items: {
    foodId: string;
    name: string;
    recQty: number;
    eaten: boolean;
    mealTime: string;
  }[] = [];

  recommendedMeals.forEach((meal) => {
    meal.meal_items?.forEach((item) => {
      if (item.food) {
        items.push({
          foodId: item.food.id,
          name: item.food.name,
          recQty: item.quantity_tbsp || 1,
          eaten: item.actually_eaten,
          mealTime: meal.meal_time,
        });
      }
    });
  });

  if (items.length === 0) {
    return (
      <div className="card-static p-4">
        <p className="text-sm text-muted text-center py-4">
          Aucun aliment dans les gamelles recommandées.
        </p>
      </div>
    );
  }

  const MEAL_LABELS: Record<string, string> = {
    matin: '🌅',
    midi: '☀️',
    soir: '🌙',
  };

  const eatenCount = items.filter((i) => i.eaten).length;
  const totalCount = items.length;
  const pct = Math.round((eatenCount / totalCount) * 100);

  return (
    <div className="card-static overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">📋 Suivi des gamelles recommandées</h3>
        <span className="text-xs text-muted">
          {eatenCount}/{totalCount} mangés ({pct}%)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="text-left p-3 font-medium">Repas</th>
              <th className="text-left p-3 font-medium">Aliment</th>
              <th className="text-center p-3 font-medium">Quantité</th>
              <th className="text-center p-3 font-medium">Mangé ?</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={`${item.foodId}-${item.mealTime}-${i}`}
                className="border-b border-border/50 hover:bg-white/[0.02]"
              >
                <td className="p-3 text-muted">{MEAL_LABELS[item.mealTime]}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3 text-center text-muted">{item.recQty} càs</td>
                <td className="p-3 text-center">
                  {item.eaten ? (
                    <span className="text-accent-green">✅</span>
                  ) : (
                    <span className="text-danger">❌</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
