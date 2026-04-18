'use client';

import { useState, useMemo } from 'react';
import { X, Search, AlertTriangle, ShieldAlert, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Food, FoodCategory, MealTime } from '@/types/database';
import { getDangerColor, getDangerLabel, cn } from '@/lib/utils';

interface PendingItem {
  food: Food;
  quantity: number;
}

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: Food[];
  categories: FoodCategory[];
  mealTime: MealTime;
  seasonalFoodIds: Set<string>;
  onAddMultiple: (items: { foodId: string; quantity: number }[]) => void;
}

export function AddFoodModal({
  isOpen,
  onClose,
  foods,
  categories,
  mealTime,
  seasonalFoodIds,
  onAddMultiple,
}: AddFoodModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState<PendingItem[]>([]);

  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || f.category_id === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [foods, search, selectedCategory]);

  const handleAddToPending = () => {
    if (!selectedFood || selectedFood.is_forbidden) return;
    // Add to pending list (or update quantity if already there)
    setPending((prev) => {
      const existing = prev.find((p) => p.food.id === selectedFood.id);
      if (existing) {
        return prev.map((p) =>
          p.food.id === selectedFood.id
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      }
      return [...prev, { food: selectedFood, quantity }];
    });
    setSelectedFood(null);
    setQuantity(1);
  };

  const handleRemovePending = (foodId: string) => {
    setPending((prev) => prev.filter((p) => p.food.id !== foodId));
  };

  const handleConfirmAll = () => {
    if (pending.length === 0) return;
    onAddMultiple(pending.map((p) => ({ foodId: p.food.id, quantity: p.quantity })));
    setPending([]);
    setSearch('');
    setSelectedFood(null);
    onClose();
  };

  const handleClose = () => {
    setPending([]);
    setSearch('');
    setSelectedFood(null);
    setSelectedCategory(null);
    onClose();
  };

  if (!isOpen) return null;

  const NO_SEASON_CATS = [
    'a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000008',
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[85vh] bg-card rounded-t-3xl sm:rounded-3xl border border-border overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">
            Ajouter des aliments — {mealTime === 'matin' ? '🌅 Matin' : mealTime === 'midi' ? '☀️ Midi' : '🌙 Soir'}
          </h3>
          <button onClick={handleClose} className="p-1.5 rounded-xl hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Pending items banner */}
        {pending.length > 0 && (
          <div className="px-4 pt-3 space-y-1.5">
            <p className="text-xs font-medium text-accent-green">
              {pending.length} aliment{pending.length > 1 ? 's' : ''} sélectionné{pending.length > 1 ? 's' : ''} :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pending.map((p) => (
                <span
                  key={p.food.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-green/10 text-accent-green text-xs"
                >
                  {p.food.name} ({p.quantity} càs)
                  <button
                    onClick={() => handleRemovePending(p.food.id)}
                    className="hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un aliment..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
                !selectedCategory ? 'bg-accent-violet text-white' : 'bg-white/5 text-muted hover:bg-white/10'
              )}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
                  selectedCategory === cat.id ? 'text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                )}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color ?? '#A855F7' } : undefined}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Food list */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {filteredFoods.map((food) => {
            const isInPending = pending.some((p) => p.food.id === food.id);
            return (
              <button
                key={food.id}
                onClick={() => {
                  if (food.is_forbidden) return;
                  setSelectedFood(food);
                }}
                disabled={food.is_forbidden}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  food.is_forbidden
                    ? 'bg-danger/5 cursor-not-allowed opacity-60'
                    : isInPending
                    ? 'bg-accent-green/10 border border-accent-green/30'
                    : selectedFood?.id === food.id
                    ? 'bg-accent-violet/10 border border-accent-violet'
                    : 'hover:bg-white/5'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{food.name}</span>
                    {isInPending && <Check size={14} className="text-accent-green shrink-0" />}
                    {food.danger_level > 0 && (
                      <Badge color={getDangerColor(food.danger_level)}>
                        {food.danger_level === 3 ? <ShieldAlert size={10} /> : <AlertTriangle size={10} />}
                        {' '}{getDangerLabel(food.danger_level)}
                      </Badge>
                    )}
                  </div>
                  {food.danger_note && <p className="text-xs text-muted mt-0.5 truncate">{food.danger_note}</p>}
                  {food.is_forbidden && <p className="text-xs text-danger mt-0.5 font-medium">⛔ INTERDIT</p>}
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  {food.beta_carotene_rich && <Badge color="#F97316">β-carotène</Badge>}
                  {!food.is_forbidden && seasonalFoodIds.size > 0 && !seasonalFoodIds.has(food.id) &&
                   !NO_SEASON_CATS.includes(food.category_id || '') && (
                    <Badge color="#6B7280" variant="outline">🌍 Hors saison</Badge>
                  )}
                </div>
              </button>
            );
          })}
          {filteredFoods.length === 0 && (
            <p className="text-center text-sm text-muted py-8">Aucun aliment trouvé</p>
          )}
        </div>

        {/* Bottom panel: quantity + add / confirm */}
        <div className="p-4 border-t border-border space-y-3">
          {selectedFood && !selectedFood.is_forbidden && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate flex-1">{selectedFood.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold"
                >−</button>
                <span className="text-sm font-semibold w-16 text-center">{quantity} càs</span>
                <button
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold"
                >+</button>
              </div>
              <button
                onClick={handleAddToPending}
                className="ml-3 p-2 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white transition-colors"
                title="Ajouter à la sélection"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          <button
            onClick={handleConfirmAll}
            disabled={pending.length === 0}
            className="w-full py-3 rounded-xl bg-accent-green hover:bg-accent-green/90 text-white font-semibold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Ajouter {pending.length} aliment{pending.length > 1 ? 's' : ''} à la gamelle
          </button>
        </div>
      </div>
    </div>
  );
}
