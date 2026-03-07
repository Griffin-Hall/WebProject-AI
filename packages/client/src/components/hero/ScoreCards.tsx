import { motion } from 'framer-motion';
import { Sun, DollarSign, Shield, Sparkles } from 'lucide-react';
import type { DimensionScores } from '@voyage-matcher/shared';

interface ScoreCardsProps {
  scores: DimensionScores;
  accentColor: string;
  delay?: number;
}

const DIMENSIONS = [
  { key: 'weather' as const, label: 'Weather', icon: Sun },
  { key: 'budget' as const, label: 'Budget', icon: DollarSign },
  { key: 'safety' as const, label: 'Safety', icon: Shield },
  { key: 'vibe' as const, label: 'Vibe', icon: Sparkles },
];

function CircularProgress({ value, size = 44, strokeWidth = 3, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

export function ScoreCards({ scores, accentColor, delay = 0 }: ScoreCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {DIMENSIONS.map((dim, i) => {
        const value = scores[dim.key];
        const Icon = dim.icon;
        const pct = Math.round(value * 100);
        return (
          <motion.div
            key={dim.key}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-3"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + i * 0.08, type: 'spring', stiffness: 200 }}
          >
            <div className="relative">
              <CircularProgress value={value} color={accentColor} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="h-4 w-4 text-white/70" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-white/90">{pct}%</span>
            <span className="text-[10px] text-white/40">{dim.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
