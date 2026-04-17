'use client';

import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { NutrientBar } from '@/components/ui/NutrientBar';
import type { DailyNutritionSummary, NutrientKey, NUTRIENT_TARGETS } from '@/types/database';

const NUTRIENTS: {
  key: string;
  actualKey: string;
  targetKey: string;
  label: string;
  unit: string;
  critical: boolean;
  suggestions: string;
}[] = [
  {
    key: 'vitamin_a',
    actualKey: 'actual_vitamin_a_ug',
    targetKey: 'target_vitamin_a_ug',
    label: 'Vitamine A',
    unit: 'µg',
    critical: true,
    suggestions: 'Carotte, patate douce, mangue, potiron, poivron rouge',
  },
  {
    key: 'vitamin_c',
    actualKey: 'actual_vitamin_c_mg',
    targetKey: 'target_vitamin_c_mg',
    label: 'Vitamine C',
    unit: 'mg',
    critical: false,
    suggestions: 'Goyave, poivron rouge, kiwi, piment, brocoli',
  },
  {
    key: 'vitamin_e',
    actualKey: 'actual_vitamin_e_mg',
    targetKey: 'target_vitamin_e_mg',
    label: 'Vitamine E',
    unit: 'mg',
    critical: false,
    suggestions: 'Graines tournesol germées, pissenlit, épinards',
  },
  {
    key: 'calcium',
    actualKey: 'actual_calcium_mg',
    targetKey: 'target_calcium_mg',
    label: 'Calcium',
    unit: 'mg',
    critical: false,
    suggestions: 'Brocoli, pissenlit, basilic, pois mange-tout',
  },
  {
    key: 'iron',
    actualKey: 'actual_iron_mg',
    targetKey: 'target_iron_mg',
    label: 'Fer',
    unit: 'mg',
    critical: false,
    suggestions: 'Lentilles cuites, épinards, piment, pissenlit',
  },
  {
    key: 'protein',
    actualKey: 'actual_protein_g',
    targetKey: 'target_protein_g',
    label: 'Protéines',
    unit: 'g',
    critical: false,
    suggestions: 'Germinations, lentilles cuites, pois chiches, quinoa',
  },
  {
    key: 'fiber',
    actualKey: 'actual_fiber_g',
    targetKey: 'target_fiber_g',
    label: 'Fibres',
    unit: 'g',
    critical: false,
    suggestions: 'Pois chiches, lentilles, goyave, grenade, poire',
  },
];

interface NutritionPanelProps {
  summary: DailyNutritionSummary | null;
}

export function NutritionPanel({ summary }: NutritionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const deficiencies = summary
    ? NUTRIENTS.filter((n) => {
        const actual = (summary as any)[n.actualKey] ?? 0;
        const target = (summary as any)[n.targetKey] ?? 1;
        return (actual / target) * 100 < 70;
      })
    : [];

  return (
    <div className="card-static overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-semibold text-sm">📊 Bilan nutritionnel</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Nutrient bars */}
          <div className="space-y-3">
            {NUTRIENTS.map((n) => (
              <NutrientBar
                key={n.key}
                label={n.label}
                actual={(summary as any)?.[n.actualKey] ?? 0}
                target={(summary as any)?.[n.targetKey] ?? 1}
                unit={n.unit}
                critical={n.critical}
              />
            ))}
          </div>

          {/* Deficiencies card */}
          {deficiencies.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-warning font-semibold text-sm">
                <Lightbulb size={16} />
                Ce qu&apos;il lui a manqué aujourd&apos;hui
              </div>
              {deficiencies.map((n) => {
                const actual = (summary as any)?.[n.actualKey] ?? 0;
                const target = (summary as any)?.[n.targetKey] ?? 1;
                const pct = Math.round((actual / target) * 100);
                return (
                  <div key={n.key} className="text-xs space-y-0.5">
                    <p className="text-foreground">
                      <span className="font-medium">{n.label}</span> — {pct}% de
                      l&apos;objectif
                    </p>
                    <p className="text-muted">→ Ajouter demain : {n.suggestions}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
