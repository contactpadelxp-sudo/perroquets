'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, AlertTriangle, Camera, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { DailyMeal, MealItem, MealTime } from '@/types/database';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const MEAL_LABELS: Record<string, string> = {
  matin: '🌅 Matin',
  midi: '☀️ Midi',
  soir: '🌙 Soir',
};

interface MealCardProps {
  mealTime: MealTime;
  meal: DailyMeal | null;
  seasonalFoodIds: Set<string>;
  onAddFood: (mealTime: MealTime) => void;
  onToggleEaten: (itemId: string, eaten: boolean) => void;
  onToggleSeed: (itemId: string, removed: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onPhotoChange: () => void;
}

export function MealCard({
  mealTime,
  meal,
  seasonalFoodIds,
  onAddFood,
  onToggleEaten,
  onToggleSeed,
  onDeleteItem,
  onPhotoChange,
}: MealCardProps) {
  const { user } = useAuth();
  const items = meal?.meal_items ?? [];
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const score = meal?.generation_nutrition_score;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !meal || !user) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo trop lourde (max 5 Mo)'); return; }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${meal.id}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from('meal-photos').upload(path, file, { upsert: true });
    if (!uploadErr) {
      await supabase.from('daily_meals').update({
        photo_url: path,
        photo_taken_at: new Date().toISOString(),
      }).eq('id', meal.id);
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

  // Check if food is NOT seasonal for current month
  const isOutOfSeason = (foodId: string, categoryId: string | null): boolean => {
    // Categories without seasonality are always "in season"
    const noSeasonCats = [
      'a1000000-0000-0000-0000-000000000003', // germinations
      'a1000000-0000-0000-0000-000000000004', // cereales
      'a1000000-0000-0000-0000-000000000005', // noix
      'a1000000-0000-0000-0000-000000000006', // fleurs
      'a1000000-0000-0000-0000-000000000007', // complements
      'a1000000-0000-0000-0000-000000000008', // interdit
    ];
    if (categoryId && noSeasonCats.includes(categoryId)) return false;
    if (seasonalFoodIds.size === 0) return false; // data not loaded yet
    return !seasonalFoodIds.has(foodId);
  };

  return (
    <div className="card-static p-4 space-y-3 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{MEAL_LABELS[mealTime]}</h3>
        {score !== null && score !== undefined && (
          <span className="text-[10px] text-accent-violet font-medium">
            {score}% couverture
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">Aucun aliment</p>
        ) : (
          items.map((item: MealItem) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-xl transition-all',
                item.actually_eaten ? 'bg-white/[0.03]' : 'bg-danger/5 opacity-60'
              )}
            >
              <button
                onClick={() => onToggleEaten(item.id, !item.actually_eaten)}
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                  item.actually_eaten ? 'bg-accent-green border-accent-green' : 'border-muted'
                )}
              >
                {item.actually_eaten && <span className="text-xs text-white">✓</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm truncate">{item.food?.name}</span>
                  {item.food?.is_forbidden && (
                    <AlertTriangle size={14} className="text-danger shrink-0" />
                  )}
                  {item.food && isOutOfSeason(item.food.id, item.food.category_id) && (
                    <Badge color="#6B7280" variant="outline">🌍 Hors saison</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.food?.category && (
                    <Badge color={item.food.category.color ?? undefined}>
                      {item.food.category.icon} {item.food.category.name}
                    </Badge>
                  )}
                  {item.quantity_tbsp && (
                    <span className="text-xs text-muted">{item.quantity_tbsp} càs</span>
                  )}
                </div>
                {item.food?.remove_seed && (
                  <button
                    onClick={() => onToggleSeed(item.id, !item.seed_removed)}
                    className={cn(
                      'flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-lg transition-colors',
                      item.seed_removed ? 'bg-accent-green/10 text-accent-green' : 'bg-danger/10 text-danger'
                    )}
                  >
                    {item.seed_removed ? '✓ Noyau retiré' : '⚠️ Confirmer retrait noyau'}
                  </button>
                )}
              </div>

              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-1 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Photo zone */}
      {meal && (
        <div className="border-t border-border pt-3">
          {photoUrl ? (
            <div className="relative inline-block">
              <img
                src={photoUrl}
                alt="Photo gamelle"
                className="w-20 h-20 rounded-xl object-cover"
              />
              <button
                onClick={handleDeletePhoto}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border hover:border-muted text-muted text-xs transition-colors"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading ? 'Upload...' : 'Ajouter une photo (optionnel)'}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      )}

      <button
        onClick={() => onAddFood(mealTime)}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-dashed border-border hover:border-accent-violet hover:bg-accent-violet/5 text-muted hover:text-accent-violet transition-all text-sm"
      >
        <Plus size={16} />
        Ajouter un aliment
      </button>
    </div>
  );
}
