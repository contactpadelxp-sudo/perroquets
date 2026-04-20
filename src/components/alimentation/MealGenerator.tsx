'use client';

import { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Loader2, Leaf, AlertTriangle, Sparkles } from 'lucide-react';
import { NutrientBar } from '@/components/ui/NutrientBar';
import { regenerateMealSuggestion } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { getSpeciesConfig } from '@/lib/species';
import type { DailyMeal, GenerationReason } from '@/types/database';

interface MealGeneratorProps {
  date: string;
  recommendedMeals: DailyMeal[];
  hasRealMeals: boolean;
  onRegenerated: () => void;
}

export function MealGenerator({ date, recommendedMeals, hasRealMeals, onRegenerated }: MealGeneratorProps) {
  const { species } = useAuth();
  const config = getSpeciesConfig(species);
  const NUTRIENT_META: Record<string, { label: string; unit: string; target: number }> = {};
  config.nutrients.forEach(n => {
    NUTRIENT_META[n.key] = { label: n.label, unit: n.unit, target: n.target };
  });

  const [loading, setLoading] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);

  const reason: GenerationReason | null = recommendedMeals[0]?.generation_reason ?? null;
  const score = recommendedMeals[0]?.generation_nutrition_score ?? null;

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await regenerateMealSuggestion(date);
      onRegenerated();
    } catch (e: any) {
      alert(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (recommendedMeals.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Nutrition score banner */}
      {score !== null && (
        <div className="card-static p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-accent-violet" />
            <div>
              <p className="text-sm font-semibold">Gamelles générées automatiquement</p>
              <p className="text-xs text-muted">Basées sur les repas réels des 7 derniers jours</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-accent-violet">{score}%</p>
            <p className="text-[10px] text-muted">couverture estimée</p>
          </div>
        </div>
      )}

      {/* Why this meal? */}
      {reason && reason.explanation_lines && reason.explanation_lines.length > 0 && (
        <div className="card-static overflow-hidden">
          <button
            onClick={() => setReasonOpen(!reasonOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-sm font-semibold flex items-center gap-2">
              <Leaf size={15} className="text-accent-green" />
              Pourquoi cette gamelle ?
            </span>
            {reasonOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {reasonOpen && (
            <div className="px-4 pb-4 space-y-2">
              {reason.explanation_lines.map((line, i) => (
                <p key={i} className="text-sm text-muted leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regenerate button (only if no real meals) */}
      {!hasRealMeals && (
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-accent-violet transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Recalculer les suggestions
        </button>
      )}
    </div>
  );
}
