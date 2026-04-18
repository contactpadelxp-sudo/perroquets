'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  UtensilsCrossed,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { DailyMeal, MealItem } from '@/types/database';
import { cn } from '@/lib/utils';

const MEAL_LABELS: Record<string, string> = {
  matin: '🌅 Matin',
  midi: '☀️ Midi',
  soir: '🌙 Soir',
};
const MEAL_ORDER: Record<string, number> = { matin: 0, midi: 1, soir: 2 };

interface DayData {
  date: string;
  meals: (DailyMeal & { meal_items: (MealItem & { food: any })[] })[];
}

export default function HistoriquePage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: meals } = await supabase
      .from('daily_meals')
      .select(`
        *,
        meal_items (
          *,
          food:foods (name, category_id, beta_carotene_rich, category:food_categories(name, icon, color))
        )
      `)
      .eq('user_id', user.id)
      .eq('is_recommended', false)
      .gte('meal_date', monthStart)
      .lte('meal_date', monthEnd)
      .order('meal_date', { ascending: false });

    // Group by date
    const byDate: Record<string, DayData['meals']> = {};
    (meals ?? []).forEach((meal: any) => {
      if (!byDate[meal.meal_date]) byDate[meal.meal_date] = [];
      byDate[meal.meal_date].push(meal);
    });

    // Sort meals within each day
    Object.values(byDate).forEach((dayMeals) => {
      dayMeals.sort((a, b) => (MEAL_ORDER[a.meal_time] ?? 0) - (MEAL_ORDER[b.meal_time] ?? 0));
    });

    const result: DayData[] = Object.entries(byDate)
      .map(([date, meals]) => ({ date, meals }))
      .sort((a, b) => b.date.localeCompare(a.date));

    setDays(result);
    setLoading(false);
  }, [user, monthStart, monthEnd]);

  useEffect(() => { loadData(); }, [loadData]);

  const getPhotoUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;
    return supabase.storage.from('meal-photos').getPublicUrl(photoPath).data.publicUrl;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">📖 Historique des gamelles</h1>

      {/* Month navigation */}
      <div className="card-static p-4 flex items-center justify-between">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-accent-violet" />
          <span className="text-lg font-semibold capitalize">
            {format(month, 'MMMM yyyy', { locale: fr })}
          </span>
        </div>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Days list */}
      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Chargement...</div>
      ) : days.length === 0 ? (
        <div className="card-static p-8 text-center space-y-3">
          <UtensilsCrossed size={32} className="mx-auto text-muted" />
          <p className="text-sm text-muted">Aucune gamelle enregistrée ce mois-ci</p>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => (
            <DayCard key={day.date} day={day} getPhotoUrl={getPhotoUrl} />
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({
  day,
  getPhotoUrl,
}: {
  day: DayData;
  getPhotoUrl: (p: string | null | undefined) => string | null;
}) {
  const dateFormatted = format(new Date(day.date), 'EEEE d MMMM', { locale: fr });
  const totalItems = day.meals.reduce((sum, m) => sum + (m.meal_items?.length ?? 0), 0);
  const eatenItems = day.meals.reduce(
    (sum, m) => sum + (m.meal_items?.filter((i: any) => i.actually_eaten)?.length ?? 0),
    0
  );
  const hasPhotos = day.meals.some((m) => m.photo_url);
  const score = day.meals[0]?.generation_nutrition_score;

  return (
    <div className="card-static overflow-hidden">
      {/* Day header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm capitalize">{dateFormatted}</h3>
          <p className="text-xs text-muted">
            {eatenItems}/{totalItems} aliments mangés
            {hasPhotos && <span className="ml-2">📷</span>}
          </p>
        </div>
        {score != null && (
          <div className="text-right">
            <span className="text-lg font-bold text-accent-violet">{score}%</span>
            <p className="text-[10px] text-muted">couverture</p>
          </div>
        )}
      </div>

      {/* 3 meal columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {(['matin', 'midi', 'soir'] as const).map((time) => {
          const meal = day.meals.find((m) => m.meal_time === time);
          const photo = getPhotoUrl(meal?.photo_url);
          const items = meal?.meal_items ?? [];

          return (
            <div key={time} className="p-3 space-y-2">
              <h4 className="text-xs font-semibold text-muted">
                {MEAL_LABELS[time]}
                {meal?.is_recommended && (
                  <span className="ml-1 text-accent-violet font-normal">(suggestion)</span>
                )}
              </h4>

              {/* Photo */}
              {photo && (
                <img
                  src={photo}
                  alt={`${time} ${day.date}`}
                  className="w-full h-24 object-cover rounded-xl"
                />
              )}

              {/* Food list */}
              {items.length === 0 ? (
                <p className="text-xs text-muted/50 py-2">Aucun aliment</p>
              ) : (
                <div className="space-y-1">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        !item.actually_eaten && 'opacity-40 line-through'
                      )}
                    >
                      <span className="shrink-0">
                        {item.food?.category?.icon ?? '🍽️'}
                      </span>
                      <span className="flex-1 truncate">{item.food?.name ?? '?'}</span>
                      {item.quantity_tbsp && (
                        <span className="text-muted shrink-0">
                          {item.quantity_tbsp} càs
                        </span>
                      )}
                      {item.actually_eaten ? (
                        <span className="text-accent-green shrink-0">✓</span>
                      ) : (
                        <span className="text-danger shrink-0">✗</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
