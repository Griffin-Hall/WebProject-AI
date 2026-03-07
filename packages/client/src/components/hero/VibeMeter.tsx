import { motion } from 'framer-motion';
import { Coffee, Mountain, Heart, Landmark, Music, TreePine, Crown, Wallet, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Coffee, Mountain, Heart, Landmark, Music, TreePine, Crown, Wallet,
};

interface VibeBarProps {
  id: string;
  label: string;
  score: number;
  accentColor: string;
  delay: number;
}

function VibeBar({ label, score, accentColor, delay }: VibeBarProps) {
  return (
    <motion.div
      className="flex items-center gap-2.5"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <span className="text-[11px] text-white/50 w-20 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.8, delay: delay + 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <span className="text-[10px] text-white/40 w-7 tabular-nums">{Math.round(score * 100)}%</span>
    </motion.div>
  );
}

interface VibeMeterProps {
  vibes: { id: string; label: string; score: number }[];
  accentColor: string;
  delay?: number;
}

export function VibeMeter({ vibes, accentColor, delay = 0 }: VibeMeterProps) {
  if (vibes.length === 0) return null;

  return (
    <motion.div
      className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-3">Destination Vibe</h3>
      <div className="space-y-2">
        {vibes.map((vibe, i) => (
          <VibeBar
            key={vibe.id}
            {...vibe}
            accentColor={accentColor}
            delay={delay + 0.1 + i * 0.08}
          />
        ))}
      </div>
    </motion.div>
  );
}

export { ICON_MAP };
