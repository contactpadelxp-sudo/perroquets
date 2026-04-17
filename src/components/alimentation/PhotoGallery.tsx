'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { DailyMeal } from '@/types/database';
import { cn } from '@/lib/utils';

const MEAL_LABELS: Record<string, string> = { matin: 'Matin', midi: 'Midi', soir: 'Soir' };

interface PhotoEntry {
  meal: DailyMeal;
  photoUrl: string;
  items: { name: string; qty: number }[];
}

export function PhotoGallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const targetMonth = new Date();
  targetMonth.setMonth(targetMonth.getMonth() - monthOffset);
  const monthStart = format(new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1), 'yyyy-MM-dd');
  const monthEnd = format(new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('daily_meals')
        .select('*, meal_items(food:foods(name), quantity_tbsp)')
        .eq('user_id', user.id)
        .not('photo_url', 'is', null)
        .gte('meal_date', monthStart)
        .lte('meal_date', monthEnd)
        .order('meal_date', { ascending: false });

      const entries: PhotoEntry[] = (data ?? []).map((meal: any) => ({
        meal,
        photoUrl: supabase.storage.from('meal-photos').getPublicUrl(meal.photo_url).data.publicUrl,
        items: (meal.meal_items ?? []).map((i: any) => ({
          name: i.food?.name ?? '?',
          qty: i.quantity_tbsp ?? 0,
        })),
      }));
      setPhotos(entries);
    };
    load();
  }, [user, monthStart, monthEnd]);

  const selected = selectedIdx !== null ? photos[selectedIdx] : null;

  if (photos.length === 0) {
    return (
      <div className="card-static p-8 text-center space-y-3">
        <Camera size={32} className="mx-auto text-muted" />
        <p className="text-sm text-muted">Commence à photographier tes gamelles</p>
        <p className="text-xs text-muted/50">
          Les photos apparaîtront ici sous forme de galerie
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setMonthOffset(monthOffset + 1)} className="p-1.5 rounded-xl hover:bg-white/5">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium capitalize">
          {format(targetMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))}
          disabled={monthOffset === 0}
          className="p-1.5 rounded-xl hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((entry, i) => (
          <button
            key={entry.meal.id}
            onClick={() => setSelectedIdx(i)}
            className="relative aspect-square rounded-xl overflow-hidden group"
          >
            <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
              <p className="text-[10px] text-white font-medium">
                {format(new Date(entry.meal.meal_date), 'dd/MM')} — {MEAL_LABELS[entry.meal.meal_time]}
              </p>
              {entry.meal.generation_nutrition_score && (
                <p className="text-[10px] text-accent-green">{entry.meal.generation_nutrition_score}%</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedIdx(null)} />
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <p className="font-semibold text-sm">
                  {MEAL_LABELS[selected.meal.meal_time]} — {format(new Date(selected.meal.meal_date), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <button onClick={() => setSelectedIdx(null)} className="p-1.5 rounded-xl hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            <img src={selected.photoUrl} alt="" className="w-full" />

            <div className="p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted uppercase">Aliments</h4>
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-muted">{item.qty} càs</span>
                </div>
              ))}
              {selected.items.length === 0 && (
                <p className="text-xs text-muted">Aucun aliment enregistré</p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-2 p-4 pt-0">
              <button
                onClick={() => setSelectedIdx(Math.max(0, (selectedIdx ?? 0) - 1))}
                disabled={selectedIdx === 0}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm disabled:opacity-30"
              >
                Précédente
              </button>
              <button
                onClick={() => setSelectedIdx(Math.min(photos.length - 1, (selectedIdx ?? 0) + 1))}
                disabled={selectedIdx === photos.length - 1}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm disabled:opacity-30"
              >
                Suivante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
