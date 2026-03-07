import { DollarSign } from 'lucide-react';
import type { DestinationCosts } from '@voyage-matcher/shared';
import { formatBudget } from '@/lib/utils';

interface CostBreakdownProps {
  costs: DestinationCosts;
}

export function CostBreakdown({ costs }: CostBreakdownProps) {
  const tiers = [
    { label: 'Budget', value: costs.dailyBudgetLow, color: 'bg-emerald-500', desc: 'Hostels, street food, public transit' },
    { label: 'Mid-Range', value: costs.dailyBudgetMid, color: 'bg-voyage-500', desc: 'Hotels, restaurants, some activities' },
    { label: 'Luxury', value: costs.dailyBudgetHigh, color: 'bg-amber-500', desc: 'Premium hotels, fine dining, private tours' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-gray-900">Daily Budget</h3>
      <div className="grid gap-3">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${tier.color}`} />
              <div>
                <p className="font-medium text-gray-900 text-sm">{tier.label}</p>
                <p className="text-xs text-gray-500">{tier.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-display text-lg font-bold text-gray-900">
              <DollarSign className="h-4 w-4 text-gray-400" />
              {Math.round(tier.value)}
              <span className="text-xs font-normal text-gray-500">/day</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
