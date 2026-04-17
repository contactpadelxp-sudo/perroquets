'use client';

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
  size?: number;
}

export function GaugeChart({
  value,
  max = 100,
  label,
  color = '#A855F7',
  size = 120,
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 45;
  const circumference = Math.PI * radius; // semi-circle
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox="0 0 100 70"
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d="M 5 55 A 45 45 0 0 1 95 55"
          fill="none"
          stroke="#27272A"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 5 55 A 45 45 0 0 1 95 55"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        {/* Value text */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          className="fill-foreground text-lg font-semibold"
          fontSize="18"
        >
          {Math.round(value)}
          {max === 100 ? '%' : ''}
        </text>
      </svg>
      <span className="text-xs text-muted font-medium">{label}</span>
    </div>
  );
}
