'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, AlertTriangle, Camera, X, Loader2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { DailyMeal, MealItem, MealTime, Food } from '@/types/database';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const MEAL_LABELS: Record<string, string> = {
  matin: '🌅 Matin',
  midi: '☀️ Midi',
  soir: '🌙 Soir',
};

// A draft item is a food added locally but not yet saved to DB
interface DraftItem {
  id: string; // temporary local id
  food: Food;
  quantity_tbsp: number;
}

interface MealCardProps {
  mealTime: MealTime;
  meal: DailyMeal | null;
  date: string;
  seasonalFoodIds: Set<string>;
  onAddFood: (mealTime: MealTime) => void;
  onDeleteItem: (itemId: string) => void;
  onMealSaved: () => void;
  onPhotoChange: () => void;
  // Draft management
  draftItems: DraftItem[];
  onRemoveDraft: (draftId: string) => void;
}

export type { DraftItem };

export function MealCard({
  mealTime,
  meal,
  date,
  seasonalFoodIds,
  onAddFood,
  onDeleteItem,
  onMealSaved,
  onPhotoChange,
  draftItems,
  onRemoveDraft,
}: MealCardProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const savedItems = meal?.meal_items ?? [];
  const hasDrafts = draftItems.length > 0;

  // Save all draft items to DB
  const handleSave = async () => {
    if (!user || draftItems.length === 0) return;
    setSaving(true);

    try {
      // Get or create the registered meal for this time
      let mealId: string;
      if (meal) {
        mealId = meal.id;
      } else {
        const { data, error } = await supabase
          .from('daily_meals')
          .insert({ meal_date: date, meal_time: mealTime, is_recommended: false, user_id: user.id })
          .select().single();
        if (error || !data) { toast.error('Erreur création repas'); setSaving(false); return; }
        mealId = data.id;
      }

      // Insert all draft items
      for (const draft of draftItems) {
        await supabase.from('meal_items').insert({
          meal_id: mealId,
          food_id: draft.food.id,
          quantity_tbsp: draft.quantity_tbsp,
          weight_grams: draft.quantity_tbsp * 15,
          seed_removed: draft.food.remove_seed ? false : null,
          user_id: user.id,
          actually_eaten: true,
        });
      }

      toast.success(`Gamelle ${mealTime} enregistrée !`);
      onMealSaved();
    } catch {
      toast.error('Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !meal || !user) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo trop lourde (max 5 Mo)'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${meal.id}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('meal-photos').upload(path, file, { upsert: true });
    if (!uploadErr) {
      await supabase.from('daily_meals').update({ photo_url: path, photo_taken_at: new Date().toISOString() }).eq('id', meal.id);
      onPhotoChange();
    }
    setUploading(false);
  };

  const handleDeletePhoto = async () => {
    if (!meal?.photo_url) return;
    await supabase.storage.from('meal-photos').remove([meal.photo_url]);
    await supabase.from('daily_meals').update({ photo_url: null, photo_taken_at: null }).eq('id', meal.id);
    onPhotoChange();
  };

  const photoUrl = meal?.photo_url
    ? supabase.storage.from('meal-photos').getPublicUrl(meal.photo_url).data.publicUrl
    : null;

  const isOutOfSeason = (foodId: string, categoryId: string | null): boolean => {
    const noSeasonCats = [
      'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004',
      'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006',
      'a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000008',
    ];
    if (categoryId && noSeasonCats.includes(categoryId)) return false;
    if (seasonalFoodIds.size === 0) return false;
    return !seasonalFoodIds.has(foodId);
  };

  return (
    <div className="card-static p-4 space-y-3 flex flex-col">
      <h3 className="font-semibold text-sm">{MEAL_LABELS[mealTime]}</h3>

      {/* Already saved items */}
      {savedItems.length > 0 && (
        <div className="space-y-1.5">
          {savedItems.map((item: MealItem) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03]">
              <span className="text-xs">{item.food?.category?.icon ?? '🍽️'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm truncate">{item.food?.name}</span>
                  {item.food && isOutOfSeason(item.food.id, item.food.category_id) && (
                    <Badge color="#6B7280" variant="outline">🌍</Badge>
                  )}
                </div>
                <span className="text-xs text-muted">{item.quantity_tbsp} càs</span>
              </div>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-1 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Draft items (not yet saved) */}
      {draftItems.length > 0 && (
        <div className="space-y-1.5">
          {savedItems.length > 0 && <div className="h-px bg-border" />}
          <p className="text-[10px] text-warning font-medium">En attente d&apos;enregistrement :</p>
          {draftItems.map((draft) => (
            <div key={draft.id} className="flex items-center gap-2 p-2 rounded-xl bg-warning/5 border border-warning/20">
              <span className="text-xs">{draft.food.category?.icon ?? '🍽️'}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm truncate">{draft.food.name}</span>
                <span className="text-xs text-muted ml-1.5">{draft.quantity_tbsp} càs</span>
              </div>
              <button
                onClick={() => onRemoveDraft(draft.id)}
                className="p-1 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {savedItems.length === 0 && draftItems.length === 0 && (
        <p className="text-xs text-muted py-3 text-center">Aucun aliment</p>
      )}

      {/* Photo zone (only if meal is saved) */}
      {meal && (
        <div className="border-t border-border pt-2">
          {photoUrl ? (
            <div className="relative inline-block">
              <img src={photoUrl} alt="Photo gamelle" className="w-20 h-20 rounded-xl object-cover" />
              <button onClick={handleDeletePhoto} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-border hover:border-muted text-muted text-xs transition-colors"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading ? 'Upload...' : 'Photo (optionnel)'}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" />
        </div>
      )}

      {/* Add food button */}
      <button
        onClick={() => onAddFood(mealTime)}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-dashed border-border hover:border-accent-violet hover:bg-accent-violet/5 text-muted hover:text-accent-violet transition-all text-sm"
      >
        <Plus size={16} />
        Ajouter un aliment
      </button>

      {/* Save button — only visible when there are draft items */}
      {hasDrafts && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-accent-green hover:bg-accent-green/90 text-white font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Enregistrer la gamelle
        </button>
      )}
    </div>
  );
}
