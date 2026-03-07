import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DestinationSafety } from '@voyage-matcher/shared';

interface SafetyBadgeProps {
  safety: DestinationSafety;
  size?: 'sm' | 'lg';
}

const config = {
  low: { icon: ShieldCheck, label: 'Very Safe', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  medium: { icon: Shield, label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' },
  high: { icon: ShieldAlert, label: 'Use Caution', color: 'text-orange-600', bg: 'bg-orange-50' },
  extreme: { icon: ShieldX, label: 'High Risk', color: 'text-red-600', bg: 'bg-red-50' },
};

export function SafetyBadge({ safety, size = 'sm' }: SafetyBadgeProps) {
  const c = config[safety.advisoryLevel as keyof typeof config] || config.medium;
  const Icon = c.icon;

  if (size === 'lg') {
    return (
      <div className={cn('rounded-xl p-4', c.bg)}>
        <div className="flex items-center gap-3">
          <Icon className={cn('h-6 w-6', c.color)} />
          <div>
            <p className={cn('font-semibold', c.color)}>{c.label}</p>
            <p className="text-sm text-gray-600">
              Safety score: {safety.safetyScore}/100
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Source: {safety.source} &middot; Last updated:{' '}
          {new Date(safety.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1', c.bg)}>
      <Icon className={cn('h-3.5 w-3.5', c.color)} />
      <span className={cn('text-xs font-medium', c.color)}>{c.label}</span>
    </div>
  );
}
