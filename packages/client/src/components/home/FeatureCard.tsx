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
        className="glass-card-premium p-6 h-full text-center group relative"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-voyage-500/20 via-aurora/20 to-voyage-500/20 blur-xl" />
        </div>

        {/* Icon container with enhanced hover */}
        <motion.div 
          className={cn(
            "relative mt-1 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4",
            "bg-white/[0.03] border border-white/[0.08]",
            "group-hover:border-voyage-500/30 group-hover:bg-voyage-500/5",
            "transition-all duration-300"
          )}
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl bg-voyage-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
          
          <Icon className={cn(
            "relative h-7 w-7 transition-all duration-300",
            "text-slate-400 group-hover:text-voyage-300"
          )} />
        </motion.div>

        {/* Title */}
        <h3 className="font-display font-semibold text-white tracking-tight group-hover:text-voyage-200 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
          {description}
        </p>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-16 bg-gradient-to-r from-transparent via-voyage-500/50 to-transparent transition-all duration-500" />
      </motion.div>
    </motion.div>
  );
}
