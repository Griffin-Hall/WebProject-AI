import { Shield, ShieldCheck, ShieldAlert, ShieldX, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DestinationSafety } from '@voyage-matcher/shared';

interface SafetyBadgeProps {
  safety: DestinationSafety;
  size?: 'sm' | 'lg';
}

const config = {
  low: { 
    icon: ShieldCheck, 
    label: 'Very Safe', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    description: 'This destination has excellent safety ratings and low crime rates.',
    recommendation: 'Normal precautions recommended'
  },
  medium: { 
    icon: Shield, 
    label: 'Moderate', 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10 border-amber-500/20',
    gradient: 'from-amber-500/20 to-orange-500/20',
    description: 'Standard safety precautions should be taken in this destination.',
    recommendation: 'Stay aware of your surroundings'
  },
  high: { 
    icon: ShieldAlert, 
    label: 'Use Caution', 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/10 border-orange-500/20',
    gradient: 'from-orange-500/20 to-red-500/20',
    description: 'Exercise increased caution due to elevated safety risks.',
    recommendation: 'Avoid high-risk areas, especially at night'
  },
  extreme: { 
    icon: ShieldX, 
    label: 'High Risk', 
    color: 'text-red-400', 
    bg: 'bg-red-500/10 border-red-500/20',
    gradient: 'from-red-500/20 to-rose-500/20',
    description: 'Significant safety concerns. Reconsider travel plans.',
    recommendation: 'Check government travel advisories'
  },
};

function getTrendIcon(score: number) {
  if (score >= 80) return TrendingUp;
  if (score >= 60) return Minus;
  return TrendingDown;
}

export function SafetyBadge({ safety, size = 'sm' }: SafetyBadgeProps) {
  const c = config[safety.advisoryLevel as keyof typeof config] || config.medium;
  const Icon = c.icon;
  const TrendIcon = getTrendIcon(safety.safetyScore);

  if (size === 'lg') {
    return (
      <motion.div 
        className="glass-card-premium overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with gradient */}
        <div className={cn(
          'relative px-5 py-4 bg-gradient-to-r border-b',
          c.gradient,
          c.bg
        )}>
          <div className="relative flex items-center gap-4">
            <motion.div 
              className={cn(
                'h-14 w-14 rounded-xl flex items-center justify-center',
                'bg-white/[0.08] backdrop-blur-sm border border-white/[0.1]'
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Icon className={cn('h-7 w-7', c.color)} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn('font-display font-semibold text-lg', c.color)}>
                  {c.label}
                </h3>
                <TrendIcon className={cn('h-4 w-4', c.color)} />
              </div>
              <p className="text-sm text-slate-400">
                Safety score: <span className={cn('font-semibold', c.color)}>{safety.safetyScore}/100</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {c.description}
          </p>
          
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-aurora-light shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recommendation</p>
                <p className="text-sm text-slate-300">{c.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Safety Index</span>
              <span>{safety.safetyScore}/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  safety.safetyScore >= 80 && 'bg-emerald-500',
                  safety.safetyScore >= 60 && safety.safetyScore < 80 && 'bg-amber-500',
                  safety.safetyScore >= 40 && safety.safetyScore < 60 && 'bg-orange-500',
                  safety.safetyScore < 40 && 'bg-red-500',
                )}
                initial={{ width: 0 }}
                animate={{ width: `${safety.safetyScore}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Source: {safety.source} • Updated {new Date(safety.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
        c.bg
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className={cn('h-3.5 w-3.5', c.color)} />
      <span className={cn('text-xs font-medium', c.color)}>{c.label}</span>
    </motion.div>
  );
}
