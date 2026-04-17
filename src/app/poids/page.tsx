'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, subMonths, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Plus,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { getWeightStatus, cn } from '@/lib/utils';
import type { WeightLog, UserSettings } from '@/types/database';

type Period = '1M' | '3M' | '6M' | '1A' | 'all';

export default function PoidsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [period, setPeriod] = useState<Period>('3M');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formWeight, setFormWeight] = useState(430);
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [logsRes, settingsRes] = await Promise.all([
      supabase.from('weight_logs').select('*').eq('user_id', user.id).order('weigh_date', { ascending: false }),
      supabase.from('user_settings').select('*').eq('user_id', user.id).limit(1).single(),
    ]);
    setLogs(logsRes.data ?? []);
    setSettings(settingsRes.data);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = (() => {
    const now = new Date();
    let start: Date;
    switch (period) {
      case '1M': start = subMonths(now, 1); break;
      case '3M': start = subMonths(now, 3); break;
      case '6M': start = subMonths(now, 6); break;
      case '1A': start = subMonths(now, 12); break;
      default: return [...logs].reverse();
    }
    return [...logs]
      .filter((l) => new Date(l.weigh_date) >= start)
      .reverse();
  })();

  const chartData = filteredLogs.map((l, i, arr) => {
    // Moving average (7 entries)
    const window = arr.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((s, w) => s + Number(w.weight_grams), 0) / window.length;
    return {
      date: format(new Date(l.weigh_date), 'dd/MM', { locale: fr }),
      weight: Number(l.weight_grams),
      average: Math.round(avg),
      notes: l.notes,
    };
  });

  const latest = logs[0];
  const previous = logs[1];
  const minWeight = settings?.weight_min_grams ?? 380;
  const maxWeight = settings?.weight_max_grams ?? 550;

  const variation = latest && previous
    ? Number(latest.weight_grams) - Number(previous.weight_grams)
    : null;

  const variationPct = latest && previous && Number(previous.weight_grams) > 0
    ? ((Number(latest.weight_grams) - Number(previous.weight_grams)) / Number(previous.weight_grams)) * 100
    : null;

  const status = latest
    ? getWeightStatus(Number(latest.weight_grams), minWeight, maxWeight)
    : null;

  // Recommendations
  const recommendations: string[] = [];
  if (logs.length >= 2) {
    const twoWeeksAgo = subDays(new Date(), 14);
    const recentLogs = logs.filter((l) => new Date(l.weigh_date) >= twoWeeksAgo);
    if (recentLogs.length >= 2) {
      const newest = Number(recentLogs[0].weight_grams);
      const oldest = Number(recentLogs[recentLogs.length - 1].weight_grams);
      if (oldest - newest > 10) {
        recommendations.push('⚠��� Perte de plus de 10g en 2 semaines — Consulter un vétérinaire aviaire');
      }
    }
    const oneMonthAgo = subMonths(new Date(), 1);
    const monthLogs = logs.filter((l) => new Date(l.weigh_date) >= oneMonthAgo);
    if (monthLogs.length >= 2) {
      const newest = Number(monthLogs[0].weight_grams);
      const oldest = Number(monthLogs[monthLogs.length - 1].weight_grams);
      if (newest - oldest > 30) {
        recommendations.push('⚠️ Gain de plus de 30g en 1 mois — Réduire banane, raisin, noix');
      }
    }
  }
  if (logs.length > 0) {
    const lastDate = new Date(logs[0].weigh_date);
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 14) {
      recommendations.push(`⏰ Pas de pesée depuis ${daysSince} jours ��� Pensez à peser votre oiseau`);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('weight_logs').insert({
        weigh_date: formDate,
        weight_grams: formWeight,
        notes: formNotes || null,
        user_id: user!.id,
      });
      if (error) throw error;
      toast.success('Pesée enregistrée !');
      setFormNotes('');
      await loadData();
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('weight_logs').delete().eq('id', id);
    toast.success('Pesée supprimée');
    await loadData();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">⚖️ Suivi du poids</h1>

      {/* Hero card */}
      <div className="card-static p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-violet/10 flex items-center justify-center">
              <Scale size={28} className="text-accent-violet" />
            </div>
            <div>
              <p className="text-4xl font-bold">
                {latest ? `${Number(latest.weight_grams)}g` : '—'}
              </p>
              {variation !== null && (
                <div className="flex items-center gap-1 mt-1">
                  {variation > 0 ? (
                    <TrendingUp size={14} className="text-warning" />
                  ) : variation < 0 ? (
                    <TrendingDown size={14} className="text-info" />
                  ) : (
                    <Minus size={14} className="text-muted" />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    variation > 0 ? 'text-warning' : variation < 0 ? 'text-info' : 'text-muted'
                  )}>
                    {variation > 0 ? '+' : ''}{variation}g ({variationPct?.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-xs text-muted">Plage normale : {minWeight}g – {maxWeight}g</p>
            {status && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: status.color + '20',
                  color: status.color,
                }}
              >
                {status.label === 'Normal' ? '🟢' : status.label === 'Surveiller' ? '🟡' : '🔴'} {status.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card-static p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Évolution du poids</h3>
          <div className="flex gap-1">
            {(['1M', '3M', '6M', '1A', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  period === p ? 'bg-accent-violet text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                )}
              >
                {p === 'all' ? 'Tout' : p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717A' }} />
                <YAxis
                  domain={['dataMin - 20', 'dataMax + 20']}
                  tick={{ fontSize: 10, fill: '#71717A' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1A1A1F',
                    border: '1px solid #27272A',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    `${Number(value)}g`,
                    name === 'weight' ? 'Poids' : 'Moy. 7j',
                  ]}
                />
                {/* Green zone */}
                <ReferenceArea
                  y1={minWeight}
                  y2={maxWeight}
                  fill="#22C55E"
                  fillOpacity={0.05}
                />
                <ReferenceLine
                  y={minWeight}
                  stroke="#22C55E"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={maxWeight}
                  stroke="#22C55E"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#A855F7"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#A855F7' }}
                  name="weight"
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#71717A"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="average"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm">
              Aucune donnée de poids
            </div>
          )}
        </div>
      </div>

      {/* Add weight form */}
      <div className="card-static p-4 space-y-4">
        <h3 className="font-semibold text-sm">Ajouter une pesée</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Date</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Poids (g)</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFormWeight(Math.max(0, formWeight - 1))}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                value={formWeight}
                onChange={(e) => setFormWeight(Number(e.target.value))}
                className="flex-1 px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-center focus:outline-none focus:border-accent-violet"
              />
              <button
                onClick={() => setFormWeight(formWeight + 1)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Notes</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Ex: post-mue, vétérinaire..."
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card-static p-4 space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            Recommandations
          </h3>
          {recommendations.map((rec, i) => (
            <p key={i} className="text-sm text-warning">{rec}</p>
          ))}
        </div>
      )}

      {/* History table */}
      <div className="card-static overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Historique des pesées</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-center p-3 font-medium">Poids</th>
                <th className="text-center p-3 font-medium">Variation</th>
                <th className="text-left p-3 font-medium">Note</th>
                <th className="text-center p-3 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 20).map((log, i) => {
                const prev = logs[i + 1];
                const diff = prev
                  ? Number(log.weight_grams) - Number(prev.weight_grams)
                  : null;
                return (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="p-3">
                      {format(new Date(log.weigh_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-3 text-center font-semibold">{Number(log.weight_grams)}g</td>
                    <td className="p-3 text-center">
                      {diff !== null && (
                        <span className={cn(
                          'text-xs font-medium',
                          diff > 0 ? 'text-warning' : diff < 0 ? 'text-info' : 'text-muted'
                        )}>
                          {diff > 0 ? '+' : ''}{diff}g
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted">{log.notes || '—'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-center text-muted text-sm py-8">Aucune pesée enregistrée</p>
          )}
        </div>
      </div>
    </div>
  );
}
