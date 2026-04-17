'use client';

import { getNutrientColor } from '@/lib/utils';

interface NutrientBarProps {
  label: string;
  actual: number;
  target: number;
  unit: string;
  sources?: string;
  critical?: boolean;
}

export function NutrientBar({
  label,
  actual,
  target,
  unit,
  sources,
  critical,
}: NutrientBarProps) {
  const percentage = target > 0 ? Math.min((actual / target) * 100, 150) : 0;
  const displayPct = Math.min(percentage, 100);
  const color = getNutrientColor(percentage);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {critical && <span className="text-danger mr-1">*</span>}
          {label}
        </span>
        <span className="text-muted">
          {Math.round(actual * 10) / 10}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${displayPct}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {sources && (
        <p className="text-xs text-muted">{sources}</p>
      )}
    </div>
  );
}
