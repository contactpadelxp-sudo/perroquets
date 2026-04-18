'use client';

import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState, useMemo } from 'react';
import { NutrientBar } from '@/components/ui/NutrientBar';
import { calculateNutritionFromMeals } from '@/lib/nutrition';
import type { DailyMeal } from '@/types/database';

const NUTRIENTS = [
  { key: 'vitamin_a_ug', label: 'Vitamine A', unit: 'µg', target: 800, critical: true, suggestions: 'Carotte, patate douce, mangue, potiron, poivron rouge' },
  { key: 'vitamin_c_mg', label: 'Vitamine C', unit: 'mg', target: 50, critical: false, suggestions: 'Goyave, poivron rouge, kiwi, piment, brocoli' },
  { key: 'vitamin_e_mg', label: 'Vitamine E', unit: 'mg', target: 5, critical: false, suggestions: 'Graines tournesol germées, pissenlit, épinards' },
  { key: 'calcium_mg', label: 'Calcium', unit: 'mg', target: 150, critical: false, suggestions: 'Brocoli, pissenlit, basilic, pois mange-tout' },
  { key: 'iron_mg', label: 'Fer', unit: 'mg', target: 3, critical: false, suggestions: 'Lentilles cuites, épinards, piment, pissenlit' },
  { key: 'protein_g', label: 'Protéines', unit: 'g', target: 12, critical: false, suggestions: 'Germinations, lentilles cuites, pois chiches, quinoa' },
  { key: 'fiber_g', label: 'Fibres', unit: 'g', target: 8, critical: false, suggestions: 'Pois chiches, lentilles, goyave, grenade, poire' },
];

interface NutritionPanelProps {
  meals: DailyMeal[];
}

export function NutritionPanel({ meals }: NutritionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const summary = useMemo(() => calculateNutritionFromMeals(meals), [meals]);

  const deficiencies = NUTRIENTS.filter((n) => {
    const actual = summary.nutrients[n.key] ?? 0;
    return (actual / n.target) * 100 < 70;
  });

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
            <span className="text-xs text-accent-violet font-medium">
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
              {/* Nutrient bars — based on actually eaten foods only */}
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
