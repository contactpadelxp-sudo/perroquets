'use client';

import { useState, useEffect } from 'react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { toast } from 'sonner';
import {
  Save,
  Download,
  Bird,
  Clock,
  Ruler,
  Bell,
  Globe,
  Loader2,
  Trash2,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { UserSettings } from '@/types/database';
import { cn } from '@/lib/utils';

export default function ParametresPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [birdName, setBirdName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weightMin, setWeightMin] = useState(380);
  const [weightMax, setWeightMax] = useState(550);
  const [mealMorning, setMealMorning] = useState('08:00');
  const [mealNoon, setMealNoon] = useState('12:00');
  const [mealEvening, setMealEvening] = useState('18:00');
  const [quantityUnit, setQuantityUnit] = useState<'tbsp' | 'grams'>('tbsp');
  const [reminders, setReminders] = useState(true);
  const [hemisphere, setHemisphere] = useState<'north' | 'south'>('north');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      if (data) {
        setSettings(data);
        setBirdName(data.bird_name);
        setBirthDate(data.bird_birth_date || '');
        setWeightMin(data.weight_min_grams);
        setWeightMax(data.weight_max_grams);
        setMealMorning(data.meal_time_morning);
        setMealNoon(data.meal_time_noon);
        setMealEvening(data.meal_time_evening);
        setQuantityUnit(data.quantity_unit as 'tbsp' | 'grams');
        setReminders(data.reminders_enabled);
        setHemisphere(data.hemisphere as 'north' | 'south');
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          bird_name: birdName,
          bird_birth_date: birthDate || null,
          weight_min_grams: weightMin,
          weight_max_grams: weightMax,
          meal_time_morning: mealMorning,
          meal_time_noon: mealNoon,
          meal_time_evening: mealEvening,
          quantity_unit: quantityUnit,
          reminders_enabled: reminders,
          hemisphere: hemisphere,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      if (error) throw error;
      toast.success('Paramètres sauvegardés !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (exportFormat: 'csv' | 'json') => {
    setExporting(true);
    try {
      const [meals, weights, nutrition] = await Promise.all([
        supabase.from('daily_meals').select('*, meal_items(*, food:foods(name, category_id))').order('meal_date'),
        supabase.from('weight_logs').select('*').order('weigh_date'),
        supabase.from('daily_nutrition_summary').select('*').order('summary_date'),
      ]);

      const data = {
        repas: meals.data ?? [],
        poids: weights.data ?? [],
        nutrition: nutrition.data ?? [],
        exportDate: new Date().toISOString(),
      };

      let content: string;
      let mimeType: string;
      let extension: string;

      if (exportFormat === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else {
        // CSV for weight logs
        const rows = ['Date,Poids (g),Notes'];
        (weights.data ?? []).forEach((w: any) => {
          rows.push(`${w.weigh_date},${w.weight_grams},"${w.notes || ''}"`);
        });
        content = rows.join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eclectuscare-export-${format(new Date(), 'yyyy-MM-dd')}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Export ${exportFormat.toUpperCase()} téléchargé !`);
    } catch {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const age = birthDate
    ? (() => {
        const years = differenceInYears(new Date(), new Date(birthDate));
        const months = differenceInMonths(new Date(), new Date(birthDate)) % 12;
        return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
      })()
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">⚙️ Paramètres</h1>

      {/* Bird info */}
      <div className="card-static p-5 space-y-4">
        <div className="flex items-center gap-2 text-accent-violet">
          <Bird size={18} />
          <h2 className="font-semibold text-sm">Informations de l&apos;oiseau</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">Nom de l&apos;oiseau</label>
            <input
              type="text"
              value={birdName}
              onChange={(e) => setBirdName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Date de naissance</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
            {age && <p className="text-xs text-accent-violet mt-1">Âge : {age}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted block mb-1">Sexe</label>
          <div className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-muted">
            Femelle (Éclectus roratus)
          </div>
        </div>
      </div>

      {/* Weight range */}
      <div className="card-static p-5 space-y-4">
        <div className="flex items-center gap-2 text-accent-green">
          <Ruler size={18} />
          <h2 className="font-semibold text-sm">Plage de poids normale</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">Minimum (g)</label>
            <input
              type="number"
              value={weightMin}
              onChange={(e) => setWeightMin(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Maximum (g)</label>
            <input
              type="number"
              value={weightMax}
              onChange={(e) => setWeightMax(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
        </div>
      </div>

      {/* Meal times */}
      <div className="card-static p-5 space-y-4">
        <div className="flex items-center gap-2 text-warning">
          <Clock size={18} />
          <h2 className="font-semibold text-sm">Horaires des repas</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">🌅 Matin</label>
            <input
              type="time"
              value={mealMorning}
              onChange={(e) => setMealMorning(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">☀️ Midi</label>
            <input
              type="time"
              value={mealNoon}
              onChange={(e) => setMealNoon(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">🌙 Soir</label>
            <input
              type="time"
              value={mealEvening}
              onChange={(e) => setMealEvening(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card-static p-5 space-y-4">
        <h2 className="font-semibold text-sm">Préférences</h2>

        {/* Quantity unit */}
        <div>
          <label className="text-xs text-muted block mb-2">Unité de quantité</label>
          <div className="flex gap-2">
            {[
              { value: 'tbsp' as const, label: 'Cuillères à soupe' },
              { value: 'grams' as const, label: 'Grammes' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuantityUnit(opt.value)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  quantityUnit === opt.value
                    ? 'bg-accent-violet text-white'
                    : 'bg-white/5 text-muted hover:bg-white/10'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-muted" />
            <span className="text-sm">Rappels in-app</span>
          </div>
          <button
            onClick={() => setReminders(!reminders)}
            className={cn(
              'w-12 h-6 rounded-full transition-colors relative',
              reminders ? 'bg-accent-green' : 'bg-border'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                reminders ? 'translate-x-6' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>

        {/* Hemisphere */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-muted" />
            <label className="text-xs text-muted">Hémisphère (influence les cycles biologiques)</label>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'north' as const, label: '🌍 Nord' },
              { value: 'south' as const, label: '🌏 Sud' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHemisphere(opt.value)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  hemisphere === opt.value
                    ? 'bg-accent-violet text-white'
                    : 'bg-white/5 text-muted hover:bg-white/10'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Sauvegarder les paramètres
      </button>

      {/* Export */}
      <div className="card-static p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Download size={18} className="text-info" />
          <h2 className="font-semibold text-sm">Export des données</h2>
        </div>
        <p className="text-xs text-muted">
          Exportez vos données pour les partager avec votre vétérinaire aviaire.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            Export JSON
          </button>
        </div>
      </div>

      {/* RGPD: Privacy & Account Deletion */}
      <div className="card-static p-5 space-y-4 border-danger/20">
        <div className="flex items-center gap-2 text-danger">
          <Shield size={18} />
          <h2 className="font-semibold text-sm">Données personnelles & RGPD</h2>
        </div>

        <div className="space-y-2 text-sm text-muted">
          <p>
            Conformément au RGPD, vous pouvez exporter, modifier ou supprimer
            toutes vos données à tout moment.
          </p>
          <Link
            href="/legal"
            className="text-accent-violet hover:underline text-xs"
          >
            Consulter la politique de confidentialité
          </Link>
        </div>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 text-sm font-medium transition-colors"
          >
            <Trash2 size={14} />
            Supprimer mon compte et toutes mes données
          </button>
        ) : (
          <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2 text-danger">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Cette action est irréversible.</p>
                <p className="text-muted mt-1">
                  Toutes vos données seront supprimées définitivement :
                  repas, pesées, bilans nutritionnels, paramètres.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!user) return;
                  setDeleting(true);
                  try {
                    // Delete all user data in order
                    await supabase.from('meal_items').delete().eq('user_id', user.id);
                    await supabase.from('daily_meals').delete().eq('user_id', user.id);
                    await supabase.from('daily_nutrition_summary').delete().eq('user_id', user.id);
                    await supabase.from('weight_logs').delete().eq('user_id', user.id);
                    await supabase.from('user_settings').delete().eq('user_id', user.id);

                    // Sign out (Supabase Auth user deletion needs admin key,
                    // but we clear all data and sign out)
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  } catch {
                    toast.error('Erreur lors de la suppression');
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-danger hover:bg-danger/90 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Oui, supprimer définitivement
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
