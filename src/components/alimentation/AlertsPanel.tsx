'use client';

import type { Alert } from '@/types/database';

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="card-static p-4">
        <p className="text-sm text-accent-green font-medium">✅ Aucune alerte — tout est bon !</p>
      </div>
    );
  }

  return (
    <div className="card-static p-4 space-y-2">
      <h3 className="font-semibold text-sm mb-3">🚨 Alertes actives</h3>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 p-2.5 rounded-xl text-sm ${
            alert.type === 'danger'
              ? 'bg-danger/5 text-danger'
              : alert.type === 'warning'
              ? 'bg-warning/5 text-warning'
              : 'bg-info/5 text-info'
          }`}
        >
          <span className="shrink-0">{alert.icon || '⚠️'}</span>
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
