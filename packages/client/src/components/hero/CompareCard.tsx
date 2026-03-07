import { motion } from 'framer-motion';
import { Sun, DollarSign, Shield, Sparkles, MapPin } from 'lucide-react';
import type { MatchResult, DestinationDetail } from '@voyage-matcher/shared';
import { computeMonthScores, computeVibeScores } from './heroConstants';
import { MONTH_NAMES } from '@/lib/constants';

interface CompareCardProps {
  result: MatchResult;
  detail: DestinationDetail | null;
  accentColor: string;
  delay?: number;
}

function MiniBar({ value, color, maxWidth = 80 }: { value: number; color: string; maxWidth?: number }) {
  return (
    <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden" style={{ width: maxWidth }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

export function CompareCard({ result, detail, accentColor, delay = 0 }: CompareCardProps) {
  const pct = Math.round(result.compositeScore * 100);
  const tags = detail?.tags.map(t => t.tag) || result.tags;
  const vibes = computeVibeScores(tags, result.dailyBudgetMid);
  const bestMonths = detail?.weather
    ? computeMonthScores(detail.weather).sort((a, b) => b.score - a.score).slice(0, 3)
    : [];

  return (
    <motion.div
      className="flex-1 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-4 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-white/10">
          {result.imageUrl && (
            <img src={result.imageUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{result.city}</h4>
          <div className="flex items-center gap-1 text-[10px] text-white/40">
            <MapPin className="h-2.5 w-2.5" />
            {result.country}
          </div>
        </div>
        <div className="ml-auto text-right shrink-0">
          <span className="text-lg font-bold text-white">{pct}%</span>
          <span className="block text-[9px] text-white/40">match</span>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-1.5">
        {[
          { key: 'weather', label: 'Weather', icon: Sun, value: result.scores.weather },
          { key: 'budget', label: 'Budget', icon: DollarSign, value: result.scores.budget },
          { key: 'safety', label: 'Safety', icon: Shield, value: result.scores.safety },
          { key: 'vibe', label: 'Vibe', icon: Sparkles, value: result.scores.vibe },
        ].map(dim => (
          <div key={dim.key} className="flex items-center gap-2">
            <dim.icon className="h-3 w-3 text-white/40 shrink-0" />
            <span className="text-[10px] text-white/50 w-12 shrink-0">{dim.label}</span>
            <MiniBar value={dim.value} color={accentColor} />
            <span className="text-[10px] text-white/40 w-6 text-right tabular-nums">{Math.round(dim.value * 100)}</span>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/[0.04] py-1.5">
          <div className="text-[11px] font-medium text-white/80">${result.dailyBudgetMid}</div>
          <div className="text-[8px] text-white/35">per day</div>
        </div>
        <div className="rounded-lg bg-white/[0.04] py-1.5">
          <div className="text-[11px] font-medium text-white/80">{result.safetyScore}</div>
          <div className="text-[8px] text-white/35">safety</div>
        </div>
        <div className="rounded-lg bg-white/[0.04] py-1.5">
          <div className="text-[11px] font-medium text-white/80">{result.avgTempC != null ? `${result.avgTempC}°` : '—'}</div>
          <div className="text-[8px] text-white/35">avg temp</div>
        </div>
      </div>

      {/* Best months */}
      {bestMonths.length > 0 && (
        <div>
          <div className="text-[9px] text-white/40 mb-1">Best months</div>
          <div className="flex gap-1">
            {bestMonths.map(m => (
              <span key={m.month} className="rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] px-2 py-0.5">
                {MONTH_NAMES[m.month - 1]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Vibes */}
      {vibes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {vibes.slice(0, 4).map(v => (
            <span key={v.id} className="rounded-full bg-white/[0.06] text-[9px] text-white/50 px-2 py-0.5">
              {v.label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
