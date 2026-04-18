'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { toast } from 'sonner';
import { DailySummary } from '@/components/alimentation/DailySummary';
import { MealCard } from '@/components/alimentation/MealCard';
import { AddFoodModal } from '@/components/alimentation/AddFoodModal';
import { ComparisonTable } from '@/components/alimentation/ComparisonTable';
import { NutritionPanel } from '@/components/alimentation/NutritionPanel';
import { AlertsPanel } from '@/components/alimentation/AlertsPanel';
import { MealGenerator } from '@/components/alimentation/MealGenerator';
import { HistoryCalendar } from '@/components/alimentation/HistoryCalendar';
import { NutritionCharts } from '@/components/alimentation/NutritionCharts';
import { PhotoGallery } from '@/components/alimentation/PhotoGallery';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { calculateNutritionFromMeals } from '@/lib/nutrition';
import type { DailyMeal, Food, FoodCategory, MealTime } from '@/types/database';
import { cn } from '@/lib/utils';

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

  // Nutrition calculated client-side from actual meals
  const nutrition = useMemo(() => calculateNutritionFromMeals(meals), [meals]);

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

  // Load seasonality
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

  // Auto-generate meals for today
  useEffect(() => {
    if (!user || !foods.length || date !== format(new Date(), 'yyyy-MM-dd')) return;

    const autoGenerate = async () => {
      // Check if already has meals for today
      const { data: existing } = await supabase
        .from('daily_meals')
        .select('id')
        .eq('meal_date', date)
        .eq('user_id', user.id)
        .limit(1);

      if (existing && existing.length > 0) return; // Already has meals

      // Generate simple balanced meals from available foods
      const safeFoods = foods.filter(f => !f.is_forbidden);
      const fruits = safeFoods.filter(f => f.category_id === 'a1000000-0000-0000-0000-000000000001');
      const legumes = safeFoods.filter(f => f.category_id === 'a1000000-0000-0000-0000-000000000002');
      const germinations = safeFoods.filter(f => f.category_id === 'a1000000-0000-0000-0000-000000000003');
      const cereales = safeFoods.filter(f => f.category_id === 'a1000000-0000-0000-0000-000000000004');
      const noix = safeFoods.filter(f => f.category_id === 'a1000000-0000-0000-0000-000000000005');

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

      const plan: Record<string, { food: any; qty: number }[]> = {
        matin: [],
        midi: [],
        soir: [],
      };

      // Matin: germination + 1 fruit beta + 1 légume
      if (germinations[0]) plan.matin.push({ food: germinations[0], qty: 2 });
      const fruitsPicked = pick(fruits, 3, true);
      const legumesPicked = pick(legumes, 3, true);
      if (fruitsPicked[0]) plan.matin.push({ food: fruitsPicked[0], qty: 1.5 });
      if (legumesPicked[0]) plan.matin.push({ food: legumesPicked[0], qty: 1.5 });

      // Midi: 2 légumes + 1 fruit + céréale
      if (legumesPicked[1]) plan.midi.push({ food: legumesPicked[1], qty: 1.5 });
      if (legumesPicked[2]) plan.midi.push({ food: legumesPicked[2], qty: 1 });
      if (fruitsPicked[1]) plan.midi.push({ food: fruitsPicked[1], qty: 1 });
      const cerealPick = pick(cereales, 1);
      if (cerealPick[0]) plan.midi.push({ food: cerealPick[0], qty: 1 });

      // Soir: 1 fruit + 1 légume + noix
      if (fruitsPicked[2]) plan.soir.push({ food: fruitsPicked[2], qty: 1 });
      const extraLeg = pick(legumes.filter(l => !legumesPicked.find(p => p.id === l.id)), 1);
      if (extraLeg[0]) plan.soir.push({ food: extraLeg[0], qty: 1.5 });
      const nutPick = pick(noix, 1);
      if (nutPick[0]) plan.soir.push({ food: nutPick[0], qty: 0.5 });

      // Save to database
      for (const [mealTime, items] of Object.entries(plan)) {
        if (items.length === 0) continue;
        const { data: newMeal, error } = await supabase
          .from('daily_meals')
          .insert({ meal_date: date, meal_time: mealTime, is_recommended: true, user_id: user.id })
          .select()
          .single();
        if (error || !newMeal) continue;

        for (const item of items) {
          await supabase.from('meal_items').insert({
            meal_id: newMeal.id,
            food_id: item.food.id,
            quantity_tbsp: item.qty,
            weight_grams: item.qty * 15,
            seed_removed: item.food.remove_seed ? false : null,
            user_id: user.id,
            actually_eaten: false, // Not eaten yet, just suggested
          });
        }
      }

      await loadData();
    };

    autoGenerate();
  }, [user, foods, date]); // eslint-disable-line react-hooks/exhaustive-deps

  const getMeal = (mealTime: MealTime): DailyMeal | null => {
    return meals.find((m) => m.meal_time === mealTime) ?? null;
  };

  const handleAddFood = (mealTime: MealTime) => {
    setActiveMealTime(mealTime);
    setModalOpen(true);
  };

  const handleAddFoodConfirm = async (foodId: string, quantity: number) => {
    const food = foods.find((f) => f.id === foodId);
    if (food?.is_forbidden) {
      toast.error(`⛔ ${food.name} est un aliment INTERDIT — ${food.danger_note}`);
      return;
    }

    // Find existing non-recommended meal for this time, or create one
    const existing = meals.find((m) => m.meal_time === activeMealTime && !m.is_recommended);
    let mealId: string;

    if (existing) {
      mealId = existing.id;
    } else {
      const { data, error } = await supabase
        .from('daily_meals')
        .insert({ meal_date: date, meal_time: activeMealTime, user_id: user!.id })
        .select()
        .single();
      if (error) { toast.error('Erreur création repas'); return; }
      mealId = data.id;
    }

    const { error } = await supabase.from('meal_items').insert({
      meal_id: mealId,
      food_id: foodId,
      quantity_tbsp: quantity,
      weight_grams: quantity * 15,
      seed_removed: food?.remove_seed ? false : null,
      user_id: user!.id,
      actually_eaten: true,
    });

    if (error) { toast.error('Erreur ajout aliment'); return; }
    toast.success(`${food?.name} ajouté !`);
    await loadData();
  };

  const handleToggleEaten = async (itemId: string, eaten: boolean) => {
    await supabase.from('meal_items').update({ actually_eaten: eaten }).eq('id', itemId);
    await loadData();
  };

  const handleToggleSeed = async (itemId: string, removed: boolean) => {
    await supabase.from('meal_items').update({ seed_removed: removed }).eq('id', itemId);
    toast.success(removed ? 'Noyau confirmé retiré ✓' : 'Retrait noyau non confirmé');
    await loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from('meal_items').delete().eq('id', itemId);
    toast.success('Aliment supprimé');
    await loadData();
  };

  const recommendedMeals = meals.filter((m) => m.is_recommended);
  const hasRealMeals = meals.some((m) => !m.is_recommended);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">🍽️ Alimentation</h1>

      {/* Section A: Daily Summary — based on actually eaten foods */}
      <DailySummary
        date={date}
        meals={meals}
        onPrevDay={() => setDate(format(subDays(new Date(date), 1), 'yyyy-MM-dd'))}
        onNextDay={() => setDate(format(addDays(new Date(date), 1), 'yyyy-MM-dd'))}
      />

      {/* Auto-generation info */}
      <MealGenerator
        date={date}
        recommendedMeals={recommendedMeals}
        hasRealMeals={hasRealMeals}
        onRegenerated={loadData}
      />

      {/* Section B: Meal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['matin', 'midi', 'soir'] as MealTime[]).map((time) => (
          <MealCard
            key={time}
            mealTime={time}
            meal={getMeal(time)}
            seasonalFoodIds={seasonalFoodIds}
            onAddFood={handleAddFood}
            onToggleEaten={handleToggleEaten}
            onToggleSeed={handleToggleSeed}
            onDeleteItem={handleDeleteItem}
            onPhotoChange={loadData}
          />
        ))}
      </div>

      {/* Section C: Comparison recommandé vs mangé */}
      <ComparisonTable recommendedMeals={recommendedMeals} />

      {/* Section D: Nutrition Panel — calcul en temps réel à partir des aliments mangés */}
      <NutritionPanel meals={meals} />

      {/* Section E: Alerts */}
      <AlertsPanel alerts={nutrition.alerts} />

      {/* Section G: History */}
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

      {/* Add Food Modal */}
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
