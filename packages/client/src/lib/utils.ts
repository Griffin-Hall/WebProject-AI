import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatBudget(amount: number): string {
  return `$${Math.round(amount)}`;
}

export function getScoreColor(score: number): string {
  if (score >= 0.8) return 'bg-emerald-500';
  if (score >= 0.6) return 'bg-voyage-500';
  if (score >= 0.4) return 'bg-amber-500';
  return 'bg-red-400';
}

export function getScoreLabel(score: number): string {
  if (score >= 0.85) return 'Excellent';
  if (score >= 0.7) return 'Great';
  if (score >= 0.55) return 'Good';
  if (score >= 0.4) return 'Fair';
  return 'Low';
}
