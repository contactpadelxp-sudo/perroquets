'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { toast } from 'sonner';
import { DailySummary } from '@/components/alimentation/DailySummary';
import { MealCard, type DraftItem } from '@/components/alimentation/MealCard';
import { AddFoodModal } from '@/components/alimentation/AddFoodModal';
import { ComparisonTable } from '@/components/alimentation/ComparisonTable';
import { NutritionPanel } from '@/components/alimentation/NutritionPanel';
import { AlertsPanel } from '@/components/alimentation/AlertsPanel';
import { HistoryCalendar } from '@/components/alimentation/HistoryCalendar';
import { NutritionCharts } from '@/components/alimentation/NutritionCharts';
import { PhotoGallery } from '@/components/alimentation/PhotoGallery';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { calculateNutritionFromMeals } from '@/lib/nutrition';
import type { DailyMeal, Food, FoodCategory, MealTime } from '@/types/database';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const MEAL_LABELS: Record<string, string> = {
  matin: '🌅 Matin',
  midi: '☀️ Midi',
  soir: '🌙 Soir',
};

export default function AlimentationPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealTime, setActiveMealTime] = useState<MealTime>('matin');
  const [historyTab, setHistoryTab] = useState<'calendar' | 'gallery'>('calendar');
  const [seasonalFoodIds, setSeasonalFoodIds] = useState<Set<string>>(new Set());

  // Draft items per meal time — not yet saved to DB
  const [drafts, setDrafts] = useState<Record<MealTime, DraftItem[]>>({
    matin: [], midi: [], soir: [],
  });

  const suggestedMeals = useMemo(() => meals.filter(m => m.is_recommended), [meals]);
  const registeredMeals = useMemo(() => meals.filter(m => !m.is_recommended), [meals]);

  // Nutrition from REGISTERED meals only
  const nutrition = useMemo(() => calculateNutritionFromMeals(registeredMeals), [registeredMeals]);

  const loadData = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('daily_meals')
      .select('*, meal_items(*, food:foods(*, category:food_categories(*)))')
      .eq('meal_date', date)
      .eq('user_id', user.id)
      .order('meal_time');
    setMeals(data ?? []);
  }, [date, user]);

  const loadFoods = useCallback(async () => {
    const [foodsRes, catsRes] = await Promise.all([
      supabase.from('foods').select('*, category:food_categories(*)').order('name'),
      supabase.from('food_categories').select('*').order('name'),
    ]);
    setFoods(foodsRes.data ?? []);
    setCategories(catsRes.data ?? []);
  }, []);

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    supabase
      .from('food_seasonality')
      .select('food_id')
      .eq('month', currentMonth)
      .then(({ data }) => {
        if (data) setSeasonalFoodIds(new Set(data.map((r: any) => r.food_id)));
      });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadFoods(); }, [loadFoods]);

  // Reset drafts when date changes
  useEffect(() => {
    setDrafts({ matin: [], midi: [], soir: [] });
  }, [date]);

  // Auto-generate SUGGESTED meals for today
  useEffect(() => {
    if (!user || !foods.length || date !== format(new Date(), 'yyyy-MM-dd')) return;

    const autoGenerate = async () => {
      const { data: existing } = await supabase
        .from('daily_meals')
        .select('id')
        .eq('meal_date', date)
        .eq('user_id', user.id)
        .eq('is_recommended', true)
        .limit(1);

      if (existing && existing.length > 0) return;

      const safeFoods = foods.filter(f => !f.is_forbidden);
      const byCategory = (catId: string) => safeFoods.filter(f => f.category_id === catId);

      function pick(arr: any[], n: number, requireBeta = false): any[] {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        const result: any[] = [];
        if (requireBeta) {
          const beta = shuffled.find(f => f.beta_carotene_rich);
          if (beta) result.push(beta);
        }
        for (const f of shuffled) {
          if (result.length >= n) break;
          if (!result.find(r => r.id === f.id)) result.push(f);
        }
        return result;
      }

      const fruitsPicked = pick(byCategory('a1000000-0000-0000-0000-000000000001'), 3, true);
      const legumesPicked = pick(byCategory('a1000000-0000-0000-0000-000000000002'), 3, true);
      const germination = byCategory('a1000000-0000-0000-0000-000000000003')[0];
      const cerealPick = pick(byCategory('a1000000-0000-0000-0000-000000000004'), 1);
      const nutPick = pick(byCategory('a1000000-0000-0000-0000-000000000005'), 1);
      const extraLeg = pick(
        byCategory('a1000000-0000-0000-0000-000000000002').filter(l => !legumesPicked.find(p => p.id === l.id)), 1
      );

      const plan: Record<string, { food: any; qty: number }[]> = { matin: [], midi: [], soir: [] };
      if (germination) plan.matin.push({ food: germination, qty: 2 });
      if (fruitsPicked[0]) plan.matin.push({ food: fruitsPicked[0], qty: 1.5 });
      if (legumesPicked[0]) plan.matin.push({ food: legumesPicked[0], qty: 1.5 });
      if (legumesPicked[1]) plan.midi.push({ food: legumesPicked[1], qty: 1.5 });
      if (legumesPicked[2]) plan.midi.push({ food: legumesPicked[2], qty: 1 });
      if (fruitsPicked[1]) plan.midi.push({ food: fruitsPicked[1], qty: 1 });
      if (cerealPick[0]) plan.midi.push({ food: cerealPick[0], qty: 1 });
      if (fruitsPicked[2]) plan.soir.push({ food: fruitsPicked[2], qty: 1 });
      if (extraLeg[0]) plan.soir.push({ food: extraLeg[0], qty: 1.5 });
      if (nutPick[0]) plan.soir.push({ food: nutPick[0], qty: 0.5 });

      for (const [mealTime, items] of Object.entries(plan)) {
        if (items.length === 0) continue;
        const { data: newMeal } = await supabase
          .from('daily_meals')
          .insert({ meal_date: date, meal_time: mealTime, is_recommended: true, user_id: user.id })
          .select().single();
        if (!newMeal) continue;
        for (const item of items) {
          await supabase.from('meal_items').insert({
            meal_id: newMeal.id, food_id: item.food.id,
            quantity_tbsp: item.qty, weight_grams: item.qty * 15,
            seed_removed: item.food.remove_seed ? false : null,
            user_id: user.id, actually_eaten: true,
          });
        }
      }
      await loadData();
    };

    autoGenerate();
  }, [user, foods, date]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Draft management ──

  const handleAddFood = (mealTime: MealTime) => {
    setActiveMealTime(mealTime);
    setModalOpen(true);
  };

  const handleAddFoodConfirm = (foodId: string, quantity: number) => {
    const food = foods.find(f => f.id === foodId);
    if (!food) return;
    if (food.is_forbidden) {
      toast.error(`⛔ ${food.name} est un aliment INTERDIT — ${food.danger_note}`);
      return;
    }

    // Add to local drafts (NOT to DB yet)
    const draftItem: DraftItem = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      food,
      quantity_tbsp: quantity,
    };

    setDrafts(prev => ({
      ...prev,
      [activeMealTime]: [...prev[activeMealTime], draftItem],
    }));
    toast.success(`${food.name} ajouté au brouillon`);
  };

  const handleRemoveDraft = (mealTime: MealTime, draftId: string) => {
    setDrafts(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].filter(d => d.id !== draftId),
    }));
  };

  const handleMealSaved = (mealTime: MealTime) => {
    // Clear drafts for this meal time after save
    setDrafts(prev => ({ ...prev, [mealTime]: [] }));
    loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from('meal_items').delete().eq('id', itemId);
    toast.success('Aliment supprimé');
    await loadData();
  };

  const getRegisteredMeal = (time: MealTime) => registeredMeals.find(m => m.meal_time === time) ?? null;
  const getSuggestedMeal = (time: MealTime) => suggestedMeals.find(m => m.meal_time === time) ?? null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">🍽️ Alimentation</h1>

      {/* Résumé du jour — basé sur gamelles enregistrées */}
      <DailySummary
        date={date}
        meals={registeredMeals}
        onPrevDay={() => setDate(format(subDays(new Date(date), 1), 'yyyy-MM-dd'))}
        onNextDay={() => setDate(format(addDays(new Date(date), 1), 'yyyy-MM-dd'))}
      />

      {/* ════ GAMELLES SUGGÉRÉES ════ */}
      {suggestedMeals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-violet" />
            <h2 className="font-semibold text-sm text-accent-violet">Gamelles suggérées</h2>
            <span className="text-xs text-muted">— Suggestion automatique du jour</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['matin', 'midi', 'soir'] as MealTime[]).map((time) => {
              const meal = getSuggestedMeal(time);
              const items = meal?.meal_items ?? [];
              return (
                <div key={time} className="card-static p-3 space-y-2 opacity-80">
                  <h4 className="text-xs font-semibold text-muted">{MEAL_LABELS[time]}</h4>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted/50">—</p>
                  ) : (
                    items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-xs">
                        <span>{item.food?.category?.icon ?? '🍽️'}</span>
                        <span className="flex-1 truncate">{item.food?.name}</span>
                        <span className="text-muted">{item.quantity_tbsp} càs</span>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ GAMELLES ENREGISTRÉES ════ */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm">📝 Gamelles enregistrées</h2>
        <p className="text-xs text-muted">
          Ajoutez les aliments puis cliquez sur &quot;Enregistrer la gamelle&quot; pour valider.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['matin', 'midi', 'soir'] as MealTime[]).map((time) => (
            <MealCard
              key={time}
              mealTime={time}
              meal={getRegisteredMeal(time)}
              date={date}
              seasonalFoodIds={seasonalFoodIds}
              onAddFood={handleAddFood}
              onDeleteItem={handleDeleteItem}
              onMealSaved={() => handleMealSaved(time)}
              onPhotoChange={loadData}
              draftItems={drafts[time]}
              onRemoveDraft={(draftId) => handleRemoveDraft(time, draftId)}
            />
          ))}
        </div>
      </div>

      {/* Comparaison suggéré vs enregistré */}
      <ComparisonTable recommendedMeals={suggestedMeals} registeredMeals={registeredMeals} />

      {/* Bilan nutritionnel — gamelles enregistrées uniquement */}
      <NutritionPanel meals={registeredMeals} />

      {/* Alertes */}
      <AlertsPanel alerts={nutrition.alerts} />

      {/* Historique */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setHistoryTab('calendar')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              historyTab === 'calendar' ? 'bg-accent-violet text-white' : 'bg-white/5 text-muted hover:bg-white/10'
            )}
          >
            📅 Calendrier
          </button>
          <button
            onClick={() => setHistoryTab('gallery')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              historyTab === 'gallery' ? 'bg-accent-violet text-white' : 'bg-white/5 text-muted hover:bg-white/10'
            )}
          >
            📷 Galerie photos
          </button>
        </div>
        {historyTab === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HistoryCalendar selectedDate={date} onSelectDate={setDate} />
            <NutritionCharts />
          </div>
        ) : (
          <PhotoGallery />
        )}
      </div>

      <AddFoodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        foods={foods}
        categories={categories}
        mealTime={activeMealTime}
        seasonalFoodIds={seasonalFoodIds}
        onAdd={handleAddFoodConfirm}
      />
    </div>
  );
}
