'use client';

import { useState, useEffect } from 'react';
import { format, differenceInDays, getMonth } from 'date-fns';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Scale,
  Calendar,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Lightbulb,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { getActiveEventsForMonth } from '@/lib/queries';
import type {
  DailyNutritionSummary,
  WeightLog,
  BioCalendarEvent,
  UserSettings,
} from '@/types/database';
import { cn, getWeightStatus, getNutrientColor } from '@/lib/utils';

const NUTRIENT_TARGETS: Record<string, { label: string; target: number; unit: string; suggestions: string }> = {
  actual_vitamin_a_ug: { label: 'Vitamine A', target: 800, unit: 'µg', suggestions: 'Carotte, patate douce, mangue' },
  actual_vitamin_c_mg: { label: 'Vitamine C', target: 50, unit: 'mg', suggestions: 'Goyave, poivron rouge, kiwi' },
  actual_vitamin_e_mg: { label: 'Vitamine E', target: 5, unit: 'mg', suggestions: 'Graines tournesol germées, pissenlit' },
  actual_calcium_mg: { label: 'Calcium', target: 150, unit: 'mg', suggestions: 'Brocoli, pissenlit, basilic' },
  actual_iron_mg: { label: 'Fer', target: 3, unit: 'mg', suggestions: 'Lentilles, épinards, piment' },
  actual_protein_g: { label: 'Protéines', target: 12, unit: 'g', suggestions: 'Germinations, lentilles, quinoa' },
  actual_fiber_g: { label: 'Fibres', target: 8, unit: 'g', suggestions: 'Pois chiches, goyave, grenade' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [latestWeight, setLatestWeight] = useState<WeightLog | null>(null);
  const [previousWeight, setPreviousWeight] = useState<WeightLog | null>(null);
  const [events, setEvents] = useState<BioCalendarEvent[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [vitAHistory, setVitAHistory] = useState<{ date: string; value: number }[]>([]);
  const [weightHistory, setWeightHistory] = useState<{ date: string; value: number }[]>([]);
  const [todayMealCount, setTodayMealCount] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    const loadAll = async () => {
      const [summaryRes, weightsRes, eventsRes, settingsRes, nutritionHistRes, mealsRes] =
        await Promise.all([
          supabase.from('daily_nutrition_summary').select('*').eq('summary_date', today).eq('user_id', user.id).single(),
          supabase.from('weight_logs').select('*').eq('user_id', user.id).order('weigh_date', { ascending: false }).limit(2),
          supabase.from('bio_calendar_events').select('*'),
          supabase.from('user_settings').select('*').eq('user_id', user.id).limit(1).single(),
          supabase
            .from('daily_nutrition_summary')
            .select('summary_date, actual_vitamin_a_ug')
            .eq('user_id', user.id)
            .order('summary_date', { ascending: false })
            .limit(7),
          supabase
            .from('daily_meals')
            .select('id, meal_time, is_recommended, meal_items(id, actually_eaten)')
            .eq('meal_date', today)
            .eq('user_id', user.id),
        ]);

      setSummary(summaryRes.data);
      if (weightsRes.data?.[0]) setLatestWeight(weightsRes.data[0]);
      if (weightsRes.data?.[1]) setPreviousWeight(weightsRes.data[1]);
      setEvents(eventsRes.data ?? []);
      setSettings(settingsRes.data);

      setVitAHistory(
        (nutritionHistRes.data ?? []).reverse().map((d: any) => ({
          date: d.summary_date,
          value: d.actual_vitamin_a_ug,
        }))
      );

      // Weight sparkline
      const { data: wh } = await supabase
        .from('weight_logs')
        .select('weigh_date, weight_grams')
        .eq('user_id', user.id)
        .order('weigh_date', { ascending: false })
        .limit(7);
      setWeightHistory(
        (wh ?? []).reverse().map((w: any) => ({
          date: w.weigh_date,
          value: Number(w.weight_grams),
        }))
      );

      // Count distinct meal_times that have at least one actually_eaten item
      const mealsWithFood = new Set<string>();
      mealsRes.data?.forEach((m: any) => {
        const hasEaten = m.meal_items?.some((i: any) => i.actually_eaten);
        if (hasEaten) mealsWithFood.add(m.meal_time);
      });
      setTodayMealCount(mealsWithFood.size);
    };

    loadAll();
  }, [today, user]);

  const currentMonth = getMonth(new Date()) + 1;
  const activeEvents = getActiveEventsForMonth(events, currentMonth);

  // Next event countdown
  const getNextEvent = (): { event: BioCalendarEvent; daysUntil: number } | null => {
    const now = new Date();
    const currentM = getMonth(now) + 1;
    let closest: { event: BioCalendarEvent; daysUntil: number } | null = null;

    events.forEach((event) => {
      const start = event.recurrence_month_start;
      if (start === null) return;
      let targetYear = now.getFullYear();
      if (start <= currentM) targetYear += 1;
      const targetDate = new Date(targetYear, start - 1, 1);
      const daysUntil = differenceInDays(targetDate, now);
      if (!closest || daysUntil < closest.daysUntil) {
        closest = { event, daysUntil };
      }
    });

    return closest;
  };

  const nextEvent = getNextEvent();

  const weightVariation = latestWeight && previousWeight
    ? Number(latestWeight.weight_grams) - Number(previousWeight.weight_grams)
    : null;

  const weightStatus = latestWeight
    ? getWeightStatus(
        Number(latestWeight.weight_grams),
        settings?.weight_min_grams ?? 380,
        settings?.weight_max_grams ?? 550
      )
    : null;

  // Deficiencies
  const deficiencies = summary
    ? Object.entries(NUTRIENT_TARGETS).filter(([key, meta]) => {
        const actual = (summary as any)[key] ?? 0;
        return (actual / meta.target) * 100 < 70;
      })
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent-violet/10 flex items-center justify-center text-3xl">
          🦜
        </div>
        <div>
          <h1 className="text-2xl font-bold">{settings?.bird_name ?? 'Mon Éclectus'}</h1>
          <p className="text-sm text-muted">
            {settings?.bird_birth_date
              ? `${Math.floor(differenceInDays(new Date(), new Date(settings.bird_birth_date)) / 365)} ans`
              : 'Éclectus roratus femelle'}
          </p>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Meals today */}
        <Link href="/alimentation" className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted">
            <UtensilsCrossed size={16} />
            <span className="text-xs font-medium">Repas du jour</span>
          </div>
          <p className="text-2xl font-bold">{todayMealCount}/3</p>
          <p className="text-xs text-muted">gamelles données</p>
        </Link>

        {/* Weight */}
        <Link href="/poids" className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted">
            <Scale size={16} />
            <span className="text-xs font-medium">Dernier poids</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">
              {latestWeight ? `${Number(latestWeight.weight_grams)}g` : '—'}
            </p>
            {weightVariation !== null && (
              <span className={cn(
                'text-xs font-medium flex items-center gap-0.5',
                weightVariation > 0 ? 'text-warning' : weightVariation < 0 ? 'text-info' : 'text-muted'
              )}>
                {weightVariation > 0 ? <TrendingUp size={12} /> : weightVariation < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                {weightVariation > 0 ? '+' : ''}{weightVariation}g
              </span>
            )}
          </div>
        </Link>

        {/* Bio cycle */}
        <Link href="/calendrier" className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted">
            <Calendar size={16} />
            <span className="text-xs font-medium">Cycle actuel</span>
          </div>
          {activeEvents.length > 0 ? (
            <div>
              <p className="text-sm font-semibold truncate" style={{ color: activeEvents[0].color ?? undefined }}>
                {activeEvents[0].title}
              </p>
              {activeEvents.length > 1 && (
                <p className="text-xs text-muted">+{activeEvents.length - 1} autre(s)</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Aucun cycle actif</p>
          )}
        </Link>

        {/* Nutrition score */}
        <Link href="/alimentation" className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted">
            <FlaskConical size={16} />
            <span className="text-xs font-medium">Score nutrition</span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{
              color: getNutrientColor(summary?.balance_score ?? 0),
            }}
          >
            {summary?.balance_score ?? 0}%
          </p>
        </Link>
      </div>

      {/* Deficiencies */}
      {deficiencies.length > 0 && (
        <div className="card-static p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Lightbulb size={16} className="text-warning" />
            Carences détectées aujourd&apos;hui
          </h3>
          {deficiencies.map(([key, meta]) => {
            const actual = (summary as any)?.[key] ?? 0;
            const pct = Math.round((actual / meta.target) * 100);
            return (
              <div key={key} className="text-sm space-y-0.5">
                <p>
                  <span className="font-medium">{meta.label}</span> — {pct}% ({Math.round(actual)}{meta.unit} / {meta.target}{meta.unit})
                </p>
                <p className="text-xs text-muted">→ {meta.suggestions}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Active alerts */}
      {summary?.alerts && summary.alerts.length > 0 && (
        <div className="card-static p-4 space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" />
            Alertes actives
          </h3>
          {summary.alerts.map((alert: any, i: number) => (
            <p key={i} className={cn(
              'text-sm',
              alert.type === 'danger' ? 'text-danger' : 'text-warning'
            )}>
              {alert.icon} {alert.message}
            </p>
          ))}
        </div>
      )}

      {/* Next bio event */}
      {nextEvent && (
        <div className="card-static p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: (nextEvent.event.color ?? '#A855F7') + '15' }}>
            {nextEvent.event.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted flex items-center gap-1">
              <Clock size={12} />
              Prochain événement biologique
            </p>
            <p className="text-sm font-semibold">{nextEvent.event.title}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent-violet">{nextEvent.daysUntil}</p>
            <p className="text-xs text-muted">jours</p>
          </div>
        </div>
      )}

      {/* Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vitamin A sparkline */}
        <div className="card-static p-4 space-y-2">
          <h4 className="text-xs font-medium text-muted">Vitamine A — 7 derniers jours</h4>
          <div className="h-16">
            {vitAHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitAHistory}>
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A1F',
                      border: '1px solid #27272A',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(v) => [`${Math.round(Number(v))}µg`, 'Vit A']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted text-center pt-4">Pas assez de données</p>
            )}
          </div>
        </div>

        {/* Weight sparkline */}
        <div className="card-static p-4 space-y-2">
          <h4 className="text-xs font-medium text-muted">Poids — 7 dernières pesées</h4>
          <div className="h-16">
            {weightHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory}>
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A1F',
                      border: '1px solid #27272A',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(v) => [`${Number(v)}g`, 'Poids']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#A855F7"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted text-center pt-4">Pas assez de données</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <Link
        href="/alimentation"
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent-green hover:bg-accent-green/90 text-white font-semibold shadow-lg shadow-accent-green/20 transition-all hover:scale-105"
      >
        <Sparkles size={18} />
        Gamelles du jour
      </Link>
    </div>
  );
}
