'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { DailyNutritionSummary } from '@/types/database';
import { cn } from '@/lib/utils';

interface HistoryCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export function HistoryCalendar({ onSelectDate, selectedDate }: HistoryCalendarProps) {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [summaries, setSummaries] = useState<DailyNutritionSummary[]>([]);
  const [photoDates, setPhotoDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(month), 'yyyy-MM-dd');
      const [summRes, photoRes] = await Promise.all([
        supabase.from('daily_nutrition_summary').select('*')
          .eq('user_id', user.id).gte('summary_date', start).lte('summary_date', end),
        supabase.from('daily_meals').select('meal_date')
          .eq('user_id', user.id).not('photo_url', 'is', null)
          .gte('meal_date', start).lte('meal_date', end),
      ]);
      setSummaries(summRes.data ?? []);
      setPhotoDates(new Set((photoRes.data ?? []).map((m: any) => m.meal_date)));
    };
    fetchData();
  }, [month, user]);

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const startDay = getDay(startOfMonth(month));
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  const getScoreColor = (date: Date): string => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const summary = summaries.find((s) => s.summary_date === dateStr);
    if (!summary) return 'bg-white/5';
    if (summary.balance_score >= 75) return 'bg-accent-green/20 text-accent-green';
    if (summary.balance_score >= 50) return 'bg-warning/20 text-warning';
    return 'bg-danger/20 text-danger';
  };

  return (
    <div className="card-static p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">📅 Historique</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(subMonths(month, 1))} className="p-1.5 rounded-xl hover:bg-white/5">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium capitalize min-w-[120px] text-center">
            {format(month, 'MMMM yyyy', { locale: fr })}
          </span>
          <button onClick={() => setMonth(addMonths(month, 1))} className="p-1.5 rounded-xl hover:bg-white/5">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-accent-green/20" /> Score ≥ 75
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-warning/20" /> Score 50-74
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-danger/20" /> Score &lt; 50
        </span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div key={i} className="text-center text-xs text-muted py-1">
            {day}
          </div>
        ))}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all relative',
                getScoreColor(day),
                isSelected && 'ring-2 ring-accent-violet scale-110'
              )}
            >
              {format(day, 'd')}
              {photoDates.has(dateStr) && (
                <span className="absolute bottom-0.5 text-[8px]">📷</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
