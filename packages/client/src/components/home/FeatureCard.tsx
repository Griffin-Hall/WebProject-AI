import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  step: number;
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, step, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative group"
    >
      {/* Connecting line to next card (hidden on last card and mobile) */}
      {step < 4 && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px">
          <div className="w-full h-full bg-gradient-to-r from-voyage-200 via-aurora/20 to-voyage-200 dark:from-voyage-800 dark:via-aurora/15 dark:to-voyage-800" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-aurora/40" />
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Step number + icon combined */}
        <div className="relative mb-5">
          {/* Outer glow ring on hover */}
          <div className="absolute inset-0 rounded-2xl bg-aurora/0 group-hover:bg-aurora/5 blur-xl transition-all duration-500" />

          {/* Icon container */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white dark:bg-night-light border border-gray-100 dark:border-white/10 shadow-sm group-hover:shadow-md group-hover:shadow-aurora/10 group-hover:border-aurora/20 transition-all duration-300">
            <Icon className="h-8 w-8 text-voyage-600 dark:text-voyage-400 group-hover:text-aurora group-hover:scale-110 transition-all duration-300" />
          </div>

          {/* Step badge - anchored to top-right of icon */}
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full gradient-ai text-white text-[11px] font-bold shadow-md shadow-aurora/25 ring-2 ring-white dark:ring-night">
            {step}
          </span>
        </div>

        {/* Text content */}
        <h3 className="font-display font-semibold text-gray-900 dark:text-white tracking-tight text-[15px]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[220px]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
