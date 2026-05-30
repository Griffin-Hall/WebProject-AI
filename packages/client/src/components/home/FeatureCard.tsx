import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <motion.div 
        className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-left transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.04]"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-voyage-300/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="mb-6 flex items-center justify-between gap-4">
          <motion.div 
            className={cn(
              'relative flex h-12 w-12 items-center justify-center rounded-xl',
              'border border-white/[0.08] bg-white/[0.04]',
              'transition-all duration-300 group-hover:border-voyage-500/30 group-hover:bg-voyage-500/[0.08]',
            )}
            whileHover={{ rotate: [0, -4, 4, 0], scale: 1.04 }}
            transition={{ duration: 0.45 }}
          >
            <Icon className="relative h-5 w-5 text-slate-300 transition-colors duration-300 group-hover:text-voyage-200" />
          </motion.div>
          <span className="font-mono text-xs text-slate-600">0{index + 1}</span>
        </div>

        <h3 className="font-display text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-voyage-100">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-slate-500 transition-colors group-hover:text-slate-400">
          {description}
        </p>

        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-voyage-400 via-sand-light to-coral-light transition-all duration-500 group-hover:w-full" />
      </motion.div>
    </motion.div>
  );
}
