'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GaugeChart } from '@/components/ui/GaugeChart';
import { Badge } from '@/components/ui/Badge';
import { calculateNutritionFromMeals } from '@/lib/nutrition';
import { useAuth } from '@/lib/auth-context';
import { getSpeciesConfig } from '@/lib/species';
import type { DailyMeal } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface DailySummaryProps {
  date: string;
  meals: DailyMeal[];
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DailySummary({ date, meals, onPrevDay, onNextDay }: DailySummaryProps) {
  const { species } = useAuth();
  const config = getSpeciesConfig(species);
  const summary = useMemo(() => calculateNutritionFromMeals(meals, species), [meals, species]);

  const isPelletsBased = species === 'african_grey' || species === 'galah';

  return (
    <div className="card-static p-6 space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button onClick={onPrevDay} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold capitalize">{formatDate(date)}</h2>
        <button onClick={onNextDay} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Diet info banner for African Grey */}
      {config.dietInfoCard && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 text-xs text-muted">
          <span className="text-warning font-medium">{config.dietInfoCard.icon} {config.dietInfoCard.title} : </span>
          {config.dietInfoCard.message}
        </div>
      )}

      {/* Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
        {isPelletsBased ? (
          <>
            <GaugeChart value={summary.pelletsPct} label="Pellets" color="#6B7280" />
            <GaugeChart value={summary.vegetablesPct} label="Légumes" color="#22C55E" />
            <GaugeChart value={summary.fruitsPct} label="Fruits" color="#F97316" />
            <GaugeChart value={summary.balanceScore} label="Score équilibre" color={config.accentColor} />
          </>
        ) : (
          <>
            <GaugeChart value={summary.fruitsPct} label="Fruits" color="#F97316" />
            <GaugeChart value={summary.vegetablesPct} label="Légumes" color="#22C55E" />
            <GaugeChart value={summary.supplementsPct} label="Compléments" color="#06B6D4" />
            <GaugeChart value={summary.balanceScore} label="Score équilibre" color={config.accentColor} />
          </>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge color={summary.hasBetaCarotene ? '#22C55E' : '#EF4444'}>
          Bêta-carotène {summary.hasBetaCarotene ? '✓' : '✗'}
        </Badge>
        {isPelletsBased ? (
          <Badge color={summary.hasPellets ? '#22C55E' : '#EF4444'}>
            Pellets {summary.hasPellets ? '✓' : '✗'}
          </Badge>
        ) : (
          <Badge color={summary.hasSprouts ? '#22C55E' : '#EF4444'}>
            Germinations {summary.hasSprouts ? '✓' : '✗'}
          </Badge>
        )}
        <Badge color={summary.uniqueFoodCount >= config.scoreConfig.diversityMinFoods ? '#22C55E' : '#F59E0B'}>
          Diversité {summary.uniqueFoodCount >= config.scoreConfig.diversityMinFoods
            ? `OK (${summary.uniqueFoodCount})`
            : `⚠️ (${summary.uniqueFoodCount}/${config.scoreConfig.diversityMinFoods})`}
        </Badge>
      </div>
    </div>
  );
}
