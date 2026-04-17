'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { DailyNutritionSummary } from '@/types/database';

export function NutritionCharts() {
  const { user } = useAuth();
  const [data, setData] = useState<DailyNutritionSummary[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const { data: summaries } = await supabase
        .from('daily_nutrition_summary')
        .select('*')
        .eq('user_id', user.id)
        .gte('summary_date', startDate.toISOString().split('T')[0])
        .order('summary_date');
      setData(summaries ?? []);
    };
    fetchData();
  }, [user]);

  const chartData = data.map((d) => ({
    date: format(new Date(d.summary_date), 'dd/MM', { locale: fr }),
    vitaminA: d.actual_vitamin_a_ug,
    score: d.balance_score,
    betaCarotene: d.has_beta_carotene ? 1 : 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="card-static p-4">
        <p className="text-sm text-muted text-center py-8">
          Pas assez de données pour afficher les graphiques (minimum 2 jours).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vitamin A chart */}
      <div className="card-static p-4 space-y-3">
        <h4 className="text-sm font-semibold">Vitamine A — 30 derniers jours</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717A' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717A' }} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1F',
                  border: '1px solid #27272A',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={800}
                stroke="#22C55E"
                strokeDasharray="5 5"
                label={{ value: 'Objectif 800µg', fill: '#22C55E', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="vitaminA"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#EF4444' }}
                name="Vit A (µg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Balance score chart */}
      <div className="card-static p-4 space-y-3">
        <h4 className="text-sm font-semibold">Score équilibre — 30 derniers jours</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717A' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717A' }} />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1F',
                  border: '1px solid #27272A',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#A855F7"
                strokeWidth={2}
                dot={{ r: 3, fill: '#A855F7' }}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
