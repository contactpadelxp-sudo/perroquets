'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'default' | 'outline';
  className?: string;
}

export function Badge({ children, color, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'text-white',
        variant === 'outline' && 'border',
        className
      )}
      style={{
        backgroundColor: variant === 'default' ? (color || '#27272A') + '20' : 'transparent',
        color: color || '#F5F5F5',
        borderColor: variant === 'outline' ? color : undefined,
      }}
    >
      {children}
    </span>
  );
}
