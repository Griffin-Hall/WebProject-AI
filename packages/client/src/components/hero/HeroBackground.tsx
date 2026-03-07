import { motion, AnimatePresence } from 'framer-motion';
import type { DestinationMood } from './heroTypes';

interface HeroBackgroundProps {
  mood: DestinationMood;
}

export function HeroBackground({ mood }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={mood.name}
          className="absolute inset-0"
          style={{ background: mood.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Dark overlay to tame the gradient intensity */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Noise texture overlay for depth */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22256%22%20height%3D%22256%22%20filter%3D%22url(%23noise)%22%20opacity%3D%221%22%2F%3E%3C%2Fsvg%3E')]" />

      {/* Subtle ambient glow — much softer */}
      <motion.div
        className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full blur-[150px]"
        animate={{ backgroundColor: mood.accentColor + '0a' }}
        transition={{ duration: 1.2 }}
      />

      {/* Bottom fade — taller and stronger for clean transition */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 dark:from-night dark:via-night/80 to-transparent" />
    </div>
  );
}
