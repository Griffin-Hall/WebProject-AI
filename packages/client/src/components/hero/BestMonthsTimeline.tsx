import { motion } from 'framer-motion';
import { MONTH_NAMES } from '@/lib/constants';
import type { MonthScore } from './heroConstants';

interface BestMonthsTimelineProps {
  monthScores: MonthScore[];
  accentColor: string;
  delay?: number;
}

function getMonthColor(score: number, rank: number): string {
  if (rank < 3) return 'bg-emerald-400';
  if (score >= 0.6) return 'bg-amber-400';
  return 'bg-white/20';
}

export function BestMonthsTimeline({ monthScores, accentColor, delay = 0 }: BestMonthsTimelineProps) {
  const currentMonth = new Date().getMonth(); // 0-indexed
  // Rank months by score
  const ranked = [...monthScores].sort((a, b) => b.score - a.score);
  const rankMap = new Map(ranked.map((m, i) => [m.month, i]));

  return (
    <motion.div
      className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Best Months</h3>
        <div className="flex items-center gap-3 text-[9px] text-white/30">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" /> Best</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" /> Good</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-1">
        {monthScores.map((m, i) => {
          const rank = rankMap.get(m.month) ?? 11;
          const isCurrentMonth = m.month - 1 === currentMonth;
          const barColor = getMonthColor(m.score, rank);

          return (
            <motion.div
              key={m.month}
              className="flex flex-col items-center gap-1 group relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.15 + i * 0.04 }}
            >
              {/* Bar */}
              <div className="w-full h-12 rounded-md bg-white/[0.04] relative overflow-hidden flex items-end">
                <motion.div
                  className={`w-full rounded-md ${barColor}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(m.score * 100, 8)}%` }}
                  transition={{ duration: 0.6, delay: delay + 0.3 + i * 0.04, ease: 'easeOut' }}
                />
                {rank < 3 && (
                  <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px]">★</div>
                )}
              </div>

              {/* Month label */}
              <span className={`text-[8px] sm:text-[9px] ${isCurrentMonth ? 'text-white font-bold' : 'text-white/35'}`}>
                {MONTH_NAMES[m.month - 1]}
              </span>

              {/* Current month indicator */}
              {isCurrentMonth && (
                <div className="h-1 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
              )}

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                <div className="bg-night-light border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white/80 whitespace-nowrap shadow-xl">
                  <div className="font-medium">{MONTH_NAMES[m.month - 1]}</div>
                  <div className="text-white/50">{m.temp}°C · {m.sunshine}h sun</div>
                  <div className="text-white/50">{m.rainfall}mm rain</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
