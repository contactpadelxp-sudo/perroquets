import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDangerColor(level: number): string {
  switch (level) {
    case 0: return '#22C55E';
    case 1: return '#F59E0B';
    case 2: return '#F97316';
    case 3: return '#EF4444';
    default: return '#6B7280';
  }
}

export function getDangerLabel(level: number): string {
  switch (level) {
    case 0: return 'Sûr';
    case 1: return 'Modération';
    case 2: return 'Déconseillé';
    case 3: return 'MORTEL';
    default: return 'Inconnu';
  }
}

export function getNutrientPercentage(actual: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((actual / target) * 100), 200);
}

export function getNutrientColor(percentage: number): string {
  if (percentage >= 80) return '#22C55E';
  if (percentage >= 50) return '#F59E0B';
  return '#EF4444';
}

export function getWeightStatus(weight: number, min: number, max: number): { label: string; color: string } {
  if (weight >= min && weight <= max) return { label: 'Normal', color: '#22C55E' };
  if (weight >= min - 20 && weight <= max + 20) return { label: 'Surveiller', color: '#F59E0B' };
  return { label: 'Consulter véto', color: '#EF4444' };
}
