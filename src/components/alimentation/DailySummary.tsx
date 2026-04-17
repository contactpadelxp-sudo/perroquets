'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GaugeChart } from '@/components/ui/GaugeChart';
import { Badge } from '@/components/ui/Badge';
import type { DailyNutritionSummary } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface DailySummaryProps {
  date: string;
  summary: DailyNutritionSummary | null;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DailySummary({ date, summary, onPrevDay, onNextDay }: DailySummaryProps) {
  return (
    <div className="card-static p-6 space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevDay}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold capitalize">{formatDate(date)}</h2>
        <button
          onClick={onNextDay}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
        <GaugeChart
          value={summary?.fruits_pct ?? 0}
          label="Fruits"
          color="#F97316"
        />
        <GaugeChart
          value={summary?.vegetables_pct ?? 0}
          label="Légumes"
          color="#22C55E"
        />
        <GaugeChart
          value={summary?.supplements_pct ?? 0}
          label="Compléments"
          color="#06B6D4"
        />
        <GaugeChart
          value={summary?.balance_score ?? 0}
          label="Score équilibre"
          color="#A855F7"
        />
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge color={summary?.has_beta_carotene ? '#22C55E' : '#EF4444'}>
          Bêta-carotène {summary?.has_beta_carotene ? '✓' : '✗'}
        </Badge>
        <Badge color={summary?.has_sprouts ? '#22C55E' : '#EF4444'}>
          Germinations {summary?.has_sprouts ? '✓' : '✗'}
        </Badge>
        <Badge
          color={
            (summary?.balance_score ?? 0) >= 50
              ? '#22C55E'
              : '#F59E0B'
          }
        >
          Diversité {(summary?.balance_score ?? 0) >= 50 ? 'OK' : '⚠️'}
        </Badge>
      </div>
    </div>
  );
}
