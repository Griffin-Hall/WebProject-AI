import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Wallet, Coffee, Crown, Info } from 'lucide-react';
import type { DestinationCosts } from '@voyage-matcher/shared';
import { cn } from '@/lib/utils';

interface CostBreakdownProps {
  costs: DestinationCosts;
}

type TierType = 'budget' | 'mid' | 'luxury';

interface TierConfig {
  key: TierType;
  label: string;
  value: number;
  color: string;
  gradient: string;
  icon: typeof Wallet;
  desc: string;
  features: string[];
}

export function CostBreakdown({ costs }: CostBreakdownProps) {
  const [activeTier, setActiveTier] = useState<TierType>('mid');

  const tiers: TierConfig[] = [
    { 
      key: 'budget', 
      label: 'Budget', 
      value: costs.dailyBudgetLow, 
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      icon: Wallet,
      desc: 'Hostels, street food, public transit',
      features: ['Hostels & Guesthouses', 'Street food & Local eateries', 'Public transportation', 'Free attractions'],
    },
    { 
      key: 'mid', 
      label: 'Mid-Range', 
      value: costs.dailyBudgetMid, 
      color: 'text-voyage-300',
      gradient: 'from-voyage-500/20 to-blue-500/20',
      icon: Coffee,
      desc: 'Hotels, restaurants, some activities',
      features: ['3-star hotels', 'Mid-range restaurants', 'Mix of transport', 'Paid attractions'],
    },
    { 
      key: 'luxury', 
      label: 'Luxury', 
      value: costs.dailyBudgetHigh, 
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-orange-500/20',
      icon: Crown,
      desc: 'Premium hotels, fine dining, private tours',
      features: ['Luxury hotels', 'Fine dining', 'Private transfers', 'VIP experiences'],
    },
  ];

  const activeTierConfig = tiers.find(t => t.key === activeTier)!;
  const maxValue = Math.max(...tiers.map(t => t.value));

  return (
    <div className="glass-card-premium p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          Daily Budget
        </h3>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Info className="h-3 w-3" />
          Per person / day
        </div>
      </div>

      {/* Tier Selection Tabs */}
      <div className="flex gap-2 mb-6">
        {tiers.map((tier) => (
          <motion.button
            key={tier.key}
            onClick={() => setActiveTier(tier.key)}
            className={cn(
              'relative flex-1 rounded-xl px-3 py-3 text-left transition-all',
              activeTier === tier.key 
                ? 'bg-white/[0.06]' 
                : 'bg-white/[0.02] hover:bg-white/[0.04]'
            )}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {activeTier === tier.key && (
              <motion.div
                layoutId="cost-tier-indicator"
                className={cn(
                  'absolute inset-0 rounded-xl border',
                  tier.key === 'budget' && 'border-emerald-500/30',
                  tier.key === 'mid' && 'border-voyage-500/30',
                  tier.key === 'luxury' && 'border-amber-500/30',
                )}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <tier.icon className={cn('h-3.5 w-3.5', tier.color)} />
                <span className="text-xs text-slate-400">{tier.label}</span>
              </div>
              <div className={cn('font-display text-xl font-bold', tier.color)}>
                ${Math.round(tier.value)}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Visual Bar Chart */}
      <div className="space-y-3 mb-6">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.key}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-slate-400">{tier.label}</span>
              <div className="flex-1 h-8 bg-white/[0.03] rounded-lg overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-lg flex items-center justify-end px-3',
                    'bg-gradient-to-r',
                    tier.gradient
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${(tier.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <span className={cn('text-sm font-semibold', tier.color)}>
                    ${Math.round(tier.value)}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Tier Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'rounded-xl p-4 bg-gradient-to-r border',
            activeTierConfig.gradient,
            activeTier === 'budget' && 'border-emerald-500/20',
            activeTier === 'mid' && 'border-voyage-500/20',
            activeTier === 'luxury' && 'border-amber-500/20',
          )}
        >
          <p className={cn('text-sm font-medium mb-3', activeTierConfig.color)}>
            {activeTierConfig.desc}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {activeTierConfig.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className={cn(
                  'h-1 w-1 rounded-full',
                  activeTier === 'budget' && 'bg-emerald-500',
                  activeTier === 'mid' && 'bg-voyage-500',
                  activeTier === 'luxury' && 'bg-amber-500',
                )} />
                {feature}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Currency note */}
      <p className="mt-4 text-xs text-slate-500 text-center">
        Prices in {costs.currency} • Last updated {new Date(costs.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  );
}
