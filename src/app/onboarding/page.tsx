'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { SPECIES_LIST } from '@/lib/species';
import type { SpeciesId } from '@/lib/species';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selected, setSelected] = useState<SpeciesId | null>(null);
  const [birdName, setBirdName] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'species' | 'name'>('species');

  const handleSelectSpecies = (id: SpeciesId) => {
    setSelected(id);
    const species = SPECIES_LIST.find(s => s.id === id);
    if (species) {
      const defaultNames: Record<string, string> = {
        eclectus: 'Mon Éclectus',
        african_grey: 'Mon Gris',
        galah: 'Mon Rosalbin',
      };
      setBirdName(defaultNames[id] || 'Mon oiseau');
    }
  };

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);

    try {
      // Get user from auth context or directly from Supabase session
      let userId = user?.id;
      if (!userId) {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        userId = sessionUser?.id;
      }
      if (!userId) {
        router.push('/login');
        return;
      }

      const speciesDefaults: Record<string, { weight_min: number; weight_max: number; name: string }> = {
        eclectus: { weight_min: 380, weight_max: 550, name: 'Mon Éclectus' },
        african_grey: { weight_min: 400, weight_max: 650, name: 'Mon Gris' },
        galah: { weight_min: 272, weight_max: 432, name: 'Mon Rosalbin' },
      };

      const defaults = speciesDefaults[selected];

      // Try update first (row may already exist from signup)
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (existing) {
        await supabase
          .from('user_settings')
          .update({
            species: selected,
            bird_name: birdName || defaults.name,
            weight_min_grams: defaults.weight_min,
            weight_max_grams: defaults.weight_max,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            species: selected,
            bird_name: birdName || defaults.name,
            weight_min_grams: defaults.weight_min,
            weight_max_grams: defaults.weight_max,
          });
      }

      // Force full page reload to refresh auth context with new settings
      window.location.href = '/';
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent-violet/10 mb-2">
            <span className="text-5xl">🦜</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur ParrotCare</h1>
          <p className="text-muted text-sm">
            {step === 'species'
              ? 'Quelle espèce de perroquet suivez-vous ?'
              : 'Comment s\'appelle votre oiseau ?'}
          </p>
        </div>

        {step === 'species' ? (
          <>
            {/* Species cards */}
            <div className="space-y-4">
              {SPECIES_LIST.map((species) => (
                <button
                  key={species.id}
                  onClick={() => handleSelectSpecies(species.id)}
                  className={cn(
                    'w-full text-left p-5 rounded-2xl border-2 transition-all duration-200',
                    selected === species.id
                      ? 'border-accent-violet bg-accent-violet/5 shadow-lg shadow-accent-violet/10'
                      : 'border-border bg-card hover:border-muted'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: species.color + '15' }}
                    >
                      {species.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{species.name}</p>
                      <p className="text-xs text-muted italic">{species.scientificName}</p>
                      <p className="text-sm text-muted mt-1">{species.description}</p>
                    </div>
                    {selected === species.id && (
                      <div className="w-6 h-6 rounded-full bg-accent-violet flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => selected && setStep('name')}
              disabled={!selected}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white font-semibold text-sm transition-all disabled:opacity-30 shadow-lg shadow-accent-violet/20"
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            {/* Name step */}
            <div className="card-static p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: (SPECIES_LIST.find(s => s.id === selected)?.color ?? '#A855F7') + '15' }}
                >
                  🦜
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {SPECIES_LIST.find(s => s.id === selected)?.name}
                  </p>
                  <p className="text-xs text-muted italic">
                    {SPECIES_LIST.find(s => s.id === selected)?.scientificName}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Nom de votre oiseau</label>
                <input
                  type="text"
                  value={birdName}
                  onChange={(e) => setBirdName(e.target.value)}
                  placeholder="Ex: Coco, Rio, Charlie..."
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('species')}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleContinue}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-accent-violet/20"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Commencer
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-xs text-muted">
          D&apos;autres espèces seront ajoutées prochainement
        </p>
      </div>
    </div>
  );
}
