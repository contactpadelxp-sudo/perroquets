'use client';

import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState, useMemo } from 'react';
import { NutrientBar } from '@/components/ui/NutrientBar';
import { calculateNutritionFromMeals } from '@/lib/nutrition';
import { useAuth } from '@/lib/auth-context';
import { getSpeciesConfig } from '@/lib/species';
import type { DailyMeal } from '@/types/database';

interface NutritionPanelProps {
  meals: DailyMeal[];
}

export function NutritionPanel({ meals }: NutritionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { species } = useAuth();
  const config = getSpeciesConfig(species);

  const NUTRIENTS = config.nutrients;

  const summary = useMemo(() => calculateNutritionFromMeals(meals, species), [meals, species]);

  const deficiencies = NUTRIENTS.filter((n) => {
    const actual = summary.nutrients[n.key] ?? 0;
    return (actual / n.target) * 100 < 70;
  });

  // Iron excess warning for African Grey
  const ironExcess = species === 'african_grey' && NUTRIENTS.find(n => n.key === 'iron_mg' && n.maxWarning)
    ? (summary.nutrients.iron_mg ?? 0) > (config.targets.iron_mg * 1.5)
    : false;

  const hasAnyFood = summary.uniqueFoodCount > 0;

  return (
    <div className="card-static overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">📊 Bilan nutritionnel du jour</span>
          {hasAnyFood && (
            <span className="text-xs font-medium" style={{ color: config.accentColor }}>
              Score : {summary.balanceScore}%
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {!hasAnyFood ? (
            <p className="text-sm text-muted text-center py-4">
              Aucun aliment enregistré comme mangé. Ajoutez des aliments aux gamelles et cochez-les comme mangés pour voir le bilan.
            </p>
          ) : (
            <>
              {/* Iron excess warning */}
              {ironExcess && (
                <div className="bg-warning/10 border border-warning/30 rounded-2xl p-3 text-sm text-warning flex items-start gap-2">
                  <span className="shrink-0">🟠</span>
                  <span>⚠️ Iron Storage Disease : apport en fer trop élevé — réduire lentilles, épinards et aliments riches en fer</span>
                </div>
              )}

              {/* Nutrient bars */}
              <div className="space-y-3">
                {NUTRIENTS.map((n) => (
                  <NutrientBar
                    key={n.key}
                    label={n.label}
                    actual={summary.nutrients[n.key] ?? 0}
                    target={n.target}
                    unit={n.unit}
                    critical={n.critical}
                  />
                ))}
              </div>

              {/* Deficiencies */}
              {deficiencies.length > 0 && (
                <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-warning font-semibold text-sm">
                    <Lightbulb size={16} />
                    Ce qu&apos;il lui manque aujourd&apos;hui
                  </div>
                  {deficiencies.map((n) => {
                    const actual = summary.nutrients[n.key] ?? 0;
                    const pct = Math.round((actual / n.target) * 100);
                    return (
                      <div key={n.key} className="text-xs space-y-0.5">
                        <p className="text-foreground">
                          <span className="font-medium">{n.label}</span> — {pct}% de l&apos;objectif
                          ({Math.round(actual * 10) / 10}{n.unit} / {n.target}{n.unit})
                        </p>
                        <p className="text-muted">→ Ajouter : {n.suggestions}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
